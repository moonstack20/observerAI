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

    scored_reviews = [r.quality_score for r in reviews if r.quality_score is not None]
    avg_score = round(sum(scored_reviews) / len(scored_reviews), 1) if scored_reviews else None

    return jsonify({
        "total_projects": total_projects,
        "total_reviews": total_reviews,
        "avg_quality_score": avg_score
    }), 200
