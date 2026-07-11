from services.cppcheck_service import run_cppcheck
from services.flawfinder_service import run_flawfinder
from services.lizard_service import run_lizard


def calculate_overall_score(cppcheck_data, flawfinder_data, lizard_data):
    # Quality score based on cppcheck issues
    quality_penalty = cppcheck_data["errors"] * 2 + cppcheck_data["warnings"] * 1 + cppcheck_data["style"] * 0.3
    quality_score = max(0, 10 - quality_penalty)

    # Security score based on flawfinder risk levels
    security_penalty = flawfinder_data["high_risk"] * 2.5 + flawfinder_data["medium_risk"] * 1
    security_score = max(0, 10 - security_penalty)

    # Complexity score based on avg cyclomatic complexity
    avg_complexity = lizard_data["avg_complexity"]
    if avg_complexity <= 5:
        complexity_score = 10
    elif avg_complexity <= 10:
        complexity_score = 7
    elif avg_complexity <= 20:
        complexity_score = 4
    else:
        complexity_score = 2

    overall = (quality_score * 0.4) + (security_score * 0.4) + (complexity_score * 0.2)
    return round(overall, 1)


def analyze_c_file(file_path):
    cppcheck_data = run_cppcheck(file_path)
    flawfinder_data = run_flawfinder(file_path)
    lizard_data = run_lizard(file_path)

    overall_score = calculate_overall_score(cppcheck_data, flawfinder_data, lizard_data)

    return {
        "overall_score": overall_score,
        "cppcheck": cppcheck_data,
        "flawfinder": flawfinder_data,
        "lizard": lizard_data,
    }
