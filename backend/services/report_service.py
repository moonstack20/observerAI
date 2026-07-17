import json
import io
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.units import inch


def generate_pdf_report(review):
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, topMargin=0.6 * inch)
    styles = getSampleStyleSheet()

    title_style = ParagraphStyle("TitleStyle", parent=styles["Title"], fontSize=20, spaceAfter=6)
    heading_style = ParagraphStyle("HeadingStyle", parent=styles["Heading2"], spaceBefore=14, spaceAfter=6)
    body_style = styles["Normal"]

    story = []
    story.append(Paragraph("Observer AI Code Review Report", title_style))
    story.append(Paragraph(f"File: {review.filename}", body_style))
    story.append(Paragraph(f"Language: {review.language.upper()}", body_style))
    story.append(Paragraph(f"Date: {review.created_at.strftime('%Y-%m-%d %H:%M')}", body_style))
    story.append(Spacer(1, 12))

    story.append(Paragraph(f"Overall Quality Score: {review.quality_score} / 10", heading_style))

    if not review.analysis_data:
        story.append(Paragraph("No analysis data available.", body_style))
        doc.build(story)
        buffer.seek(0)
        return buffer

    data = json.loads(review.analysis_data)

    story.append(Paragraph("Static Analysis Summary", heading_style))

    if review.language == "python":
        table_data = [
            ["Tool", "Metric", "Value"],
            ["Pylint", "Score", f"{data['pylint']['score']} / 10"],
            ["Pylint", "Total Issues", str(data['pylint']['total_issues'])],
            ["Bandit", "Security Issues", str(data['bandit']['total_issues'])],
            ["Bandit", "High Severity", str(data['bandit']['high'])],
            ["Radon", "Avg Complexity", str(data['radon']['avg_complexity'])],
            ["Radon", "Maintainability Index", str(data['radon']['maintainability_index'])],
        ]
    else:
        table_data = [
            ["Tool", "Metric", "Value"],
            ["Cppcheck", "Total Issues", str(data['cppcheck']['total_issues'])],
            ["Cppcheck", "Errors", str(data['cppcheck']['errors'])],
            ["Flawfinder", "Security Issues", str(data['flawfinder']['total_issues'])],
            ["Flawfinder", "High Risk", str(data['flawfinder']['high_risk'])],
            ["Lizard", "Avg Complexity", str(data['lizard']['avg_complexity'])],
            ["Lizard", "Total Lines", str(data['lizard']['total_lines'])],
        ]

    table = Table(table_data, colWidths=[1.5 * inch, 2.2 * inch, 2 * inch])
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#3B82F6")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
        ("BOTTOMPADDING", (0, 0), (-1, 0), 8),
        ("TOPPADDING", (0, 0), (-1, 0), 8),
    ]))
    story.append(table)

    ai = data.get("ai_review", {})
    if ai and not ai.get("error"):
        story.append(Paragraph("AI Review Summary", heading_style))
        story.append(Paragraph(f"AI Score: {ai.get('overall_ai_score', 'N/A')} / 10", body_style))
        story.append(Paragraph(ai.get("summary", ""), body_style))
        story.append(Spacer(1, 8))

        for key in ["bugs", "security_issues", "buffer_overflow_risks", "memory_leaks", "code_smells", "performance_issues"]:
            items = ai.get(key, [])
            if items:
                label = key.replace("_", " ").title()
                story.append(Paragraph(label, ParagraphStyle("SubHeading", parent=styles["Heading3"], spaceBefore=8)))
                for item in items:
                    line_info = f"Line {item['line']}: " if item.get("line") else ""
                    severity = f" [{item.get('severity', '').upper()}]" if item.get("severity") else ""
                    story.append(Paragraph(f"• {line_info}{item.get('description', '')}{severity}", body_style))

        suggestions = ai.get("refactoring_suggestions", [])
        if suggestions:
            story.append(Paragraph("Refactoring Suggestions", ParagraphStyle("SubHeading", parent=styles["Heading3"], spaceBefore=8)))
            for s in suggestions:
                story.append(Paragraph(f"• {s.get('description', '')}", body_style))

    doc.build(story)
    buffer.seek(0)
    return buffer


def generate_markdown_report(review):
    lines = []
    lines.append(f"# Observer AI Code Review Report\n")
    lines.append(f"**File:** {review.filename}  ")
    lines.append(f"**Language:** {review.language.upper()}  ")
    lines.append(f"**Date:** {review.created_at.strftime('%Y-%m-%d %H:%M')}  ")
    lines.append(f"**Overall Quality Score:** {review.quality_score} / 10\n")

    if not review.analysis_data:
        lines.append("No analysis data available.")
        return "\n".join(lines)

    data = json.loads(review.analysis_data)

    lines.append("## Static Analysis Summary\n")

    if review.language == "python":
        lines.append("| Tool | Metric | Value |")
        lines.append("|------|--------|-------|")
        lines.append(f"| Pylint | Score | {data['pylint']['score']} / 10 |")
        lines.append(f"| Pylint | Total Issues | {data['pylint']['total_issues']} |")
        lines.append(f"| Bandit | Security Issues | {data['bandit']['total_issues']} |")
        lines.append(f"| Bandit | High Severity | {data['bandit']['high']} |")
        lines.append(f"| Radon | Avg Complexity | {data['radon']['avg_complexity']} |")
        lines.append(f"| Radon | Maintainability Index | {data['radon']['maintainability_index']} |")
    else:
        lines.append("| Tool | Metric | Value |")
        lines.append("|------|--------|-------|")
        lines.append(f"| Cppcheck | Total Issues | {data['cppcheck']['total_issues']} |")
        lines.append(f"| Cppcheck | Errors | {data['cppcheck']['errors']} |")
        lines.append(f"| Flawfinder | Security Issues | {data['flawfinder']['total_issues']} |")
        lines.append(f"| Flawfinder | High Risk | {data['flawfinder']['high_risk']} |")
        lines.append(f"| Lizard | Avg Complexity | {data['lizard']['avg_complexity']} |")
        lines.append(f"| Lizard | Total Lines | {data['lizard']['total_lines']} |")

    ai = data.get("ai_review", {})
    if ai and not ai.get("error"):
        lines.append("\n## AI Review Summary\n")
        lines.append(f"**AI Score:** {ai.get('overall_ai_score', 'N/A')} / 10\n")
        lines.append(f"{ai.get('summary', '')}\n")

        for key in ["bugs", "security_issues", "buffer_overflow_risks", "memory_leaks", "code_smells", "performance_issues"]:
            items = ai.get(key, [])
            if items:
                label = key.replace("_", " ").title()
                lines.append(f"### {label}\n")
                for item in items:
                    line_info = f"Line {item['line']}: " if item.get("line") else ""
                    severity = f" **[{item.get('severity', '').upper()}]**" if item.get("severity") else ""
                    lines.append(f"- {line_info}{item.get('description', '')}{severity}")
                lines.append("")

        suggestions = ai.get("refactoring_suggestions", [])
        if suggestions:
            lines.append("### Refactoring Suggestions\n")
            for s in suggestions:
                lines.append(f"- {s.get('description', '')}")
                if s.get("suggestion"):
                    lines.append(f"  ```\n  {s['suggestion']}\n  ```")

    return "\n".join(lines)
