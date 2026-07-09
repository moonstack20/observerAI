import json
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from extensions import db
from models.review import Review
from services.python_analysis_service import analyze_python_file

analysis_bp = Blueprint("analysis", __name__)


@analysis_bp.route("/analyze/<int:review_id>", methods=["POST"])
@jwt_required()
def analyze_review(review_id):
    review = Review.query.get(review_id)

    if not review:
        return jsonify({"error": "Review not found"}), 404

    if review.language != "python":
        return jsonify({"error": "Only Python analysis is available right now"}), 400

    try:
        result = analyze_python_file(review.file_path)
    except Exception as e:
        return jsonify({"error": f"Analysis failed: {str(e)}"}), 500

    review.quality_score = result["overall_score"]
    review.analysis_data = json.dumps(result)
    review.status = "analyzed"
    db.session.commit()

    return jsonify({
        "message": "Analysis complete",
        "review": review.to_dict(include_analysis=True)
    }), 200


@analysis_bp.route("/review/<int:review_id>", methods=["GET"])
@jwt_required()
def get_review(review_id):
    review = Review.query.get(review_id)

    if not review:
        return jsonify({"error": "Review not found"}), 404

    return jsonify({"review": review.to_dict(include_analysis=True)}), 200
