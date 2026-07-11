from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from extensions import db
from models.project import Project
from models.review import Review
from services.upload_service import (
    validate_file, detect_language, save_uploaded_file,
    detect_language_from_content, validate_pasted_code, save_pasted_code
)

upload_bp = Blueprint("upload", __name__)


@upload_bp.route("/upload", methods=["POST"])
@jwt_required()
def upload_file():
    user_id = get_jwt_identity()

    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files["file"]

    if file.filename == "":
        return jsonify({"error": "No file selected"}), 400

    is_valid, error_message = validate_file(file)
    if not is_valid:
        return jsonify({"error": error_message}), 400

    language = detect_language(file.filename)

    project = Project.query.filter_by(user_id=user_id).first()
    if not project:
        project = Project(user_id=user_id, name="My Project", description="Default project")
        db.session.add(project)
        db.session.commit()

    file_path, saved_filename = save_uploaded_file(file)

    review = Review(
        project_id=project.id,
        filename=file.filename,
        file_path=file_path,
        language=language,
        status="uploaded"
    )
    db.session.add(review)
    db.session.commit()

    return jsonify({
        "message": "File uploaded successfully",
        "review": review.to_dict()
    }), 201

@upload_bp.route("/paste", methods=["POST"])
@jwt_required()
def paste_code():
    user_id = get_jwt_identity()
    data = request.get_json()

    content = data.get("code", "")

    is_valid, error_message = validate_pasted_code(content)
    if not is_valid:
        return jsonify({"error": error_message}), 400

    language = detect_language_from_content(content)
    if not language:
        return jsonify({"error": "Could not detect language. Please ensure this is valid Python or C code."}), 400

    project = Project.query.filter_by(user_id=user_id).first()
    if not project:
        project = Project(user_id=user_id, name="My Project", description="Default project")
        db.session.add(project)
        db.session.commit()

    file_path, saved_filename = save_pasted_code(content, language)
    filename = f"pasted_code.{('py' if language == 'python' else 'c')}"

    review = Review(
        project_id=project.id,
        filename=filename,
        file_path=file_path,
        language=language,
        status="uploaded"
    )
    db.session.add(review)
    db.session.commit()

    return jsonify({
        "message": "Code submitted successfully",
        "review": review.to_dict()
    }),201
