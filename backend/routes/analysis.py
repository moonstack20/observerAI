import json
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required

from extensions import db
from models.review import Review
from services.python_analysis_service import analyze_python_file
from services.c_analysis_service import analyze_c_file

analysis_bp = Blueprint("analysis", __name__)


@analysis_bp.route("/analyze/<int:review_id>", methods=["POST"])
@jwt_required()
def analyze_review(review_id):
    review = Review.query.get(review_id)

    if not review:
        return jsonify({"error": "Review not found"}), 404

    try:
        if review.language == "python":
            result = analyze_python_file(review.file_path)
        elif review.language == "c":
            result = analyze_c_file(review.file_path)
        else:
            return jsonify({"error": "Unsupported language"}), 400
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
