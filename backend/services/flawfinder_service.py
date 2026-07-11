import subprocess
import csv
import io


def run_flawfinder(file_path):
    try:
        result = subprocess.run(
            ["flawfinder", "--csv", "--minlevel=1", file_path],
            capture_output=True, text=True, timeout=30
        )
        output = result.stdout
    except Exception:
        output = ""

    issues = []

    if output.strip():
        reader = csv.DictReader(io.StringIO(output))
        for row in reader:
            try:
                risk_level = int(row.get("Level", 0))
            except (ValueError, TypeError):
                risk_level = 0

            issues.append({
                "line": row.get("Line"),
                "risk_level": risk_level,
                "category": row.get("Category", ""),
                "message": row.get("Warning", ""),
            })

    high_risk = [i for i in issues if i["risk_level"] >= 4]
    medium_risk = [i for i in issues if i["risk_level"] in (2, 3)]
    low_risk = [i for i in issues if i["risk_level"] <= 1]

    return {
        "total_issues": len(issues),
        "high_risk": len(high_risk),
        "medium_risk": len(medium_risk),
        "low_risk": len(low_risk),
        "issues": issues[:20],
    }
