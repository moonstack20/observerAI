import subprocess
import xml.etree.ElementTree as ET


def run_cppcheck(file_path):
    try:
        result = subprocess.run(
            ["cppcheck", "--enable=all", "--xml", "--xml-version=2", file_path],
            capture_output=True, text=True, timeout=30
        )
        xml_output = result.stderr  # cppcheck writes XML to stderr
        root = ET.fromstring(xml_output)
    except Exception:
        return {"total_issues": 0, "errors": 0, "warnings": 0, "style": 0, "issues": []}

    issues = []
    errors = warnings = style = 0

    for error in root.findall(".//error"):
        severity = error.get("severity", "")
        message = error.get("msg", "")
        line = None
        location = error.find("location")
        if location is not None:
            line = location.get("line")

        if severity == "error":
            errors += 1
        elif severity == "warning":
            warnings += 1
        else:
            style += 1

        issues.append({
            "severity": severity,
            "message": message,
            "line": int(line) if line else None,
        })

    return {
        "total_issues": len(issues),
        "errors": errors,
        "warnings": warnings,
        "style": style,
        "issues": issues[:20],
    }
