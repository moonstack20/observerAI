import json
from google import genai
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


def get_ai_review(code, language):
    prompt_template = PYTHON_PROMPT if language == "python" else C_PROMPT
    prompt = prompt_template.format(code=code)

    try:
        response = client.models.generate_content(
            model="gemini-flash-latest",
            contents=prompt,
        )
        text = response.text.strip()

        if text.startswith("```"):
            text = text.strip("`")
            if text.startswith("json"):
                text = text[4:]

        result = json.loads(text)
        return result

    except json.JSONDecodeError:
        return {"error": "AI response could not be parsed", "raw": text}
    except Exception as e:
        return {"error": f"AI review failed: {str(e)}"}
    