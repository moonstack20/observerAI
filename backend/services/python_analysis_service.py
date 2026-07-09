import json
import subprocess


def run_pylint(file_path):
    try:
        result = subprocess.run(
            ["pylint", file_path, "--output-format=json"],
            capture_output=True, text=True, timeout=30
        )
        output = result.stdout.strip()
        issues = json.loads(output) if output else []
    except Exception:
        issues = []

    errors = [i for i in issues if i.get("type") == "error"]
    warnings = [i for i in issues if i.get("type") == "warning"]
    conventions = [i for i in issues if i.get("type") in ("convention", "refactor")]

    # Pylint gives a score out of 10 in text output; we estimate from issue count instead
    total_issues = len(issues)
    score = max(0, 10 - (len(errors) * 2 + len(warnings) * 1 + len(conventions) * 0.5))

    return {
        "score": round(score, 1),
        "total_issues": total_issues,
        "errors": len(errors),
        "warnings": len(warnings),
        "conventions": len(conventions),
        "issues": issues[:20],  # cap for response size
    }


def run_bandit(file_path):
    try:
        result = subprocess.run(
            ["bandit", "-f", "json", file_path],
            capture_output=True, text=True, timeout=30
        )
        output = result.stdout.strip()
        data = json.loads(output) if output else {}
    except Exception:
        data = {}

    results = data.get("results", [])
    high = [r for r in results if r.get("issue_severity") == "HIGH"]
    medium = [r for r in results if r.get("issue_severity") == "MEDIUM"]
    low = [r for r in results if r.get("issue_severity") == "LOW"]

    return {
        "total_issues": len(results),
        "high": len(high),
        "medium": len(medium),
        "low": len(low),
        "issues": [
            {
                "issue": r.get("issue_text"),
                "severity": r.get("issue_severity"),
                "line": r.get("line_number"),
            }
            for r in results[:20]
        ],
    }


def run_radon(file_path):
    try:
        cc_result = subprocess.run(
            ["radon", "cc", file_path, "-j"],
            capture_output=True, text=True, timeout=30
        )
        cc_data = json.loads(cc_result.stdout) if cc_result.stdout.strip() else {}

        mi_result = subprocess.run(
            ["radon", "mi", file_path, "-j"],
            capture_output=True, text=True, timeout=30
        )
        mi_data = json.loads(mi_result.stdout) if mi_result.stdout.strip() else {}
    except Exception:
        cc_data = {}
        mi_data = {}

    functions = cc_data.get(file_path, [])
    avg_complexity = (
        round(sum(f["complexity"] for f in functions) / len(functions), 1)
        if functions else 0
    )

    maintainability_index = mi_data.get(file_path, {}).get("mi", None)

    return {
        "total_functions": len(functions),
        "avg_complexity": avg_complexity,
        "maintainability_index": round(maintainability_index, 1) if maintainability_index else None,
        "functions": [
            {"name": f["name"], "complexity": f["complexity"], "rank": f["rank"]}
            for f in functions
        ],
    }


def calculate_overall_score(pylint_data, bandit_data, radon_data):
    pylint_score = pylint_data["score"]  # out of 10
    security_penalty = bandit_data["high"] * 2 + bandit_data["medium"] * 1 + bandit_data["low"] * 0.5
    security_score = max(0, 10 - security_penalty)

    mi = radon_data["maintainability_index"] or 50
    maintainability_score = min(10, mi / 10)

    overall = (pylint_score * 0.4) + (security_score * 0.3) + (maintainability_score * 0.3)
    return round(overall, 1)


def analyze_python_file(file_path):
    pylint_data = run_pylint(file_path)
    bandit_data = run_bandit(file_path)
    radon_data = run_radon(file_path)

    overall_score = calculate_overall_score(pylint_data, bandit_data, radon_data)

    return {
        "overall_score": overall_score,
        "pylint": pylint_data,
        "bandit": bandit_data,
        "radon": radon_data,
    }
