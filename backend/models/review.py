from datetime import datetime
from extensions import db


class Review(db.Model):
    __tablename__ = "reviews"

    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey("projects.id"), nullable=False)
    filename = db.Column(db.String(255), nullable=False)
    file_path = db.Column(db.String(500), nullable=False)
    language = db.Column(db.String(20), nullable=False)
    quality_score = db.Column(db.Float, nullable=True)
    analysis_data = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(50), default="pending")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self, include_analysis=False):
        data = {
            "id": self.id,
            "project_id": self.project_id,
            "filename": self.filename,
            "language": self.language,
            "quality_score": self.quality_score,
            "status": self.status,
            "created_at": self.created_at.isoformat(),
        }
        if include_analysis and self.analysis_data:
            import json
            data["analysis"] = json.loads(self.analysis_data)
        return data
    