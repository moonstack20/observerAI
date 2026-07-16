import json
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from models.project import Project
from models.review import Review

dashboard_bp = Blueprint("dashboard", __name__)


@dashboard_bp.route("/summary", methods=["GET"])
@jwt_required()
def get_summary():
    user_id = get_jwt_identity()

    projects = Project.query.filter_by(user_id=user_id).all()
    project_ids = [p.id for p in projects]

    reviews = Review.query.filter(Review.project_id.in_(project_ids)).all() if project_ids else []

    total_projects = len(projects)
    total_reviews = len(reviews)

    scored_reviews = [r for r in reviews if r.quality_score is not None]
    avg_score = round(sum(r.quality_score for r in scored_reviews) / len(scored_reviews), 1) if scored_reviews else None

    issue_totals = {"bugs": 0, "security": 0, "quality": 0, "complexity": 0}
    recent_scores = []

    sorted_reviews = sorted(scored_reviews, key=lambda r: r.created_at, reverse=True)[:8]

    for r in sorted_reviews:
        recent_scores.append({
            "label": r.filename[:15],
            "score": r.quality_score,
        })

    for r in scored_reviews:
        if not r.analysis_data:
            continue
        try:
            data = json.loads(r.analysis_data)
        except Exception:
            continue

        if r.language == "python":
            issue_totals["security"] += data.get("bandit", {}).get("total_issues", 0)
            issue_totals["quality"] += data.get("pylint", {}).get("total_issues", 0)
            issue_totals["complexity"] += data.get("radon", {}).get("total_functions", 0)
        elif r.language == "c":
            issue_totals["security"] += data.get("flawfinder", {}).get("total_issues", 0)
            issue_totals["quality"] += data.get("cppcheck", {}).get("total_issues", 0)
            issue_totals["complexity"] += data.get("lizard", {}).get("total_functions", 0)

        ai = data.get("ai_review", {})
        if isinstance(ai, dict):
            issue_totals["bugs"] += len(ai.get("bugs", [])) + len(ai.get("buffer_overflow_risks", []))

    return jsonify({
        "total_projects": total_projects,
        "total_reviews": total_reviews,
        "avg_quality_score": avg_score,
        "issue_distribution": issue_totals,
        "recent_scores": list(reversed(recent_scores)),
    }), 200
