from models.user import User
from models.project import Project
from models.review import Review
from models.review_finding import ReviewFinding
from flask import Flask
from flask_cors import CORS

from config import Config
from extensions import db, jwt


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app)

    db.init_app(app)
    jwt.init_app(app)

    from routes.auth import auth_bp
    app.register_blueprint(auth_bp, url_prefix="/api/auth")

    from routes.dashboard import dashboard_bp
    app.register_blueprint(dashboard_bp, url_prefix="/api/dashboard")

    from routes.upload import upload_bp
    app.register_blueprint(upload_bp, url_prefix="/api")

    @app.route("/")
    def home():
        return {
            "message": "AI Code Review Assistant Backend is Running 🚀"
        }

    with app.app_context():
        db.create_all()

    return app


app = create_app()

if __name__ == "__main__":
    app.run(debug=True)
    