import os
import uuid

ALLOWED_EXTENSIONS = {".py": "python", ".c": "c", ".h": "c"}
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB
MAX_LINES = 5000


def detect_language(filename):
    ext = os.path.splitext(filename)[1].lower()
    return ALLOWED_EXTENSIONS.get(ext)


def is_allowed_file(filename):
    ext = os.path.splitext(filename)[1].lower()
    return ext in ALLOWED_EXTENSIONS


def validate_file(file):
    """Returns (is_valid, error_message)"""
    if not is_allowed_file(file.filename):
        return False, "Only .py, .c, .h files are allowed"

    file.seek(0, os.SEEK_END)
    size = file.tell()
    file.seek(0)

    if size == 0:
        return False, "File is empty"

    if size > MAX_FILE_SIZE:
        return False, f"File exceeds maximum size of 5 MB (got {round(size / 1024 / 1024, 2)} MB)"

    content = file.read().decode("utf-8", errors="ignore")
    file.seek(0)

    line_count = content.count("\n") + 1
    if line_count > MAX_LINES:
        return False, f"File exceeds maximum of {MAX_LINES} lines (got {line_count} lines)"

    if not content.strip():
        return False, "File is empty"

    return True, None


def save_uploaded_file(file):
    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)

    ext = os.path.splitext(file.filename)[1].lower()
    unique_name = f"{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(UPLOAD_FOLDER, unique_name)

    file.save(file_path)

    return file_path, unique_name
