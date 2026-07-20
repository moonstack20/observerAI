import json
import time
from google import genai
from google.genai import errors as genai_errors
from config import Config

client = genai.Client(api_key=Config.GEMINI_API_KEY)

PYTHON_PROMPT = """You are an expert Python code reviewer. Analyze the following Python code and respond ONLY with valid JSON (no markdown, no backticks, no preamble) in this exact structure:

{{
  "summary": "one paragraph overall summary",
  "overall_ai_score": <number 0-10>,
  "bugs": [{{"line": <int or null>, "description": "...", "severity": "high|medium|low"}}],
  "code_smells": [{{"line": <int or null>, "description": "...", "severity": "high|medium|low"}}],
  "security_issues": [{{"line": <int or null>, "description": "...", "severity": "high|medium|low"}}],
  "performance_issues": [{{"line": <int or null>, "description": "...", "severity": "high|medium|low"}}],
  "refactoring_suggestions": [{{"description": "...", "suggestion": "..."}}],
  "best_practices": [{{"description": "..."}}]
}}

Code to review:
{code}
"""

C_PROMPT = """You are an expert C code reviewer. Analyze the following C code and respond ONLY with valid JSON (no markdown, no backticks, no preamble) in this exact structure:

{{
  "summary": "one paragraph overall summary",
  "overall_ai_score": <number 0-10>,
  "buffer_overflow_risks": [{{"line": <int or null>, "description": "...", "severity": "high|medium|low"}}],
  "memory_leaks": [{{"line": <int or null>, "description": "...", "severity": "high|medium|low"}}],
  "pointer_misuse": [{{"line": <int or null>, "description": "...", "severity": "high|medium|low"}}],
  "performance_issues": [{{"line": <int or null>, "description": "...", "severity": "high|medium|low"}}],
  "security_issues": [{{"line": <int or null>, "description": "...", "severity": "high|medium|low"}}],
  "refactoring_suggestions": [{{"description": "...", "suggestion": "..."}}]
}}

Code to review:
{code}
"""

# Try the fast model first, fall back to this if it's overloaded
FALLBACK_MODEL = "gemini-2.0-flash"


def _call_gemini(prompt, model, max_retries=3):
    """Call Gemini with exponential backoff on 503/overload errors."""
    last_error = None
    for attempt in range(max_retries):
        try:
            response = client.models.generate_content(
                model=model,
                contents=prompt,
            )
            return response
        except genai_errors.ServerError as e:
            last_error = e
            if attempt < max_retries - 1:
                time.sleep(2 ** attempt)  # 1s, 2s, 4s
        except Exception as e:
            # Non-server errors (bad request, auth, etc) shouldn't be retried
            raise
    raise last_error


def get_ai_review(code, language):
    prompt_template = PYTHON_PROMPT if language == "python" else C_PROMPT
    prompt = prompt_template.format(code=code)
    text = ""

    try:
        try:
            response = _call_gemini(prompt, "gemini-flash-latest")
        except genai_errors.ServerError:
            # Primary model overloaded after retries — try fallback model once
            response = _call_gemini(prompt, FALLBACK_MODEL, max_retries=1)

        text = response.text.strip()

        # Strip markdown code fences if present
        if text.startswith("```"):
            text = text.strip("`")
            if text.lower().startswith("json"):
                text = text[4:]
            text = text.strip()

        # Extract the first {...} JSON object in case there's extra text around it
        start = text.find("{")
        end = text.rfind("}")
        if start != -1 and end != -1 and end > start:
            text = text[start:end + 1]

        result = json.loads(text)
        return result

    except json.JSONDecodeError:
        return {"error": "AI response could not be parsed", "raw": text}
    except genai_errors.ServerError as e:
        return {"error": f"AI review temporarily unavailable — Gemini is overloaded. Please try again in a moment. ({str(e)})"}
    except Exception as e:
        return {"error": f"AI review failed: {str(e)}"}
