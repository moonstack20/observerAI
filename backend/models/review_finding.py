from extensions import db


class ReviewFinding(db.Model):
    __tablename__ = "review_findings"

    id = db.Column(db.Integer, primary_key=True)
    review_id = db.Column(db.Integer, db.ForeignKey("reviews.id"), nullable=False)
    category = db.Column(db.String(50), nullable=False)  # e.g. "bug", "security", "style"
    severity = db.Column(db.String(20), nullable=False)  # "low", "medium", "high"
    message = db.Column(db.Text, nullable=False)
    line_number = db.Column(db.Integer, nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "review_id": self.review_id,
            "category": self.category,
            "severity": self.severity,
            "message": self.message,
            "line_number": self.line_number,
        }
    