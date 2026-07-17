from flask import Blueprint, jsonify, send_file, Response
from flask_jwt_extended import jwt_required

from models.review import Review
from services.report_service import generate_pdf_report, generate_markdown_report

report_bp = Blueprint("report", __name__)


@report_bp.route("/report/<int:review_id>/pdf", methods=["GET"])
@jwt_required()
def download_pdf(review_id):
    review = Review.query.get(review_id)
    if not review:
        return jsonify({"error": "Review not found"}), 404

    buffer = generate_pdf_report(review)
    filename = f"{review.filename.rsplit('.', 1)[0]}_report.pdf"

    return send_file(
        buffer,
        mimetype="application/pdf",
        as_attachment=True,
        download_name=filename,
    )


@report_bp.route("/report/<int:review_id>/markdown", methods=["GET"])
@jwt_required()
def download_markdown(review_id):
    review = Review.query.get(review_id)
    if not review:
        return jsonify({"error": "Review not found"}), 404

    content = generate_markdown_report(review)
    filename = f"{review.filename.rsplit('.', 1)[0]}_report.md"

    return Response(
        content,
        mimetype="text/markdown",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )
