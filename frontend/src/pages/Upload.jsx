import { useState } from "react";
import Layout from "../components/Layout";
import api from "../services/api";

const ALLOWED_EXTENSIONS = [".py", ".c", ".h"];

function detectLanguageLabel(filename) {
  const ext = filename.slice(filename.lastIndexOf(".")).toLowerCase();
  if (ext === ".py") return "Python";
  if (ext === ".c" || ext === ".h") return "C";
  return null;
}

function scoreColor(score) {
  if (score >= 8) return "#16a34a";
  if (score >= 5) return "#ca8a04";
  return "#dc2626";
}

function Upload() {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [analysis, setAnalysis] = useState(null);

  const validateAndSetFile = (selectedFile) => {
    setError("");
    setAnalysis(null);
    setProgress(0);

    const ext = selectedFile.name.slice(selectedFile.name.lastIndexOf(".")).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setError("Only .py, .c, .h files are allowed");
      setFile(null);
      return;
    }
    setFile(selectedFile);
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) validateAndSetFile(e.target.files[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files[0]) validateAndSetFile(e.dataTransfer.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first");
      return;
    }

    setUploading(true);
    setError("");
    setProgress(0);
    setAnalysis(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = localStorage.getItem("token");
      const uploadRes = await api.post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percent);
        },
      });

      const reviewId = uploadRes.data.review.id;
      const language = uploadRes.data.review.language;

      setUploading(false);

      if (language === "python") {
        setAnalyzing(true);
        const analyzeRes = await api.post(`/analyze/${reviewId}`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAnalysis(analyzeRes.data.review);
      } else {
        setError("C analysis isn't available yet (coming Day 6)");
      }

      setFile(null);
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    } finally {
      setUploading(false);
      setAnalyzing(false);
    }
  };

  return (
    <Layout>
      <h2>Upload Code</h2>
      <p>Upload a Python or C file to get an AI-powered code review.</p>

      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${isDragging ? "#4f46e5" : "#ccc"}`,
          borderRadius: "8px",
          padding: "40px",
          textAlign: "center",
          marginTop: "24px",
          maxWidth: "500px",
          background: isDragging ? "#f0f0ff" : "transparent",
        }}
      >
        <p>Drag & drop a .py, .c, or .h file here, or</p>
        <input type="file" accept=".py,.c,.h" onChange={handleFileChange} />

        {file && (
          <p style={{ marginTop: "12px" }}>
            Selected: <strong>{file.name}</strong>{" "}
            <span style={{ color: "#4f46e5" }}>({detectLanguageLabel(file.name)})</span>
          </p>
        )}

        {error && <p style={{ color: "red", marginTop: "8px" }}>{error}</p>}

        {uploading && (
          <div style={{ marginTop: "16px", background: "#eee", borderRadius: "6px", overflow: "hidden", height: "10px" }}>
            <div style={{ width: `${progress}%`, background: "#4f46e5", height: "100%", transition: "width 0.2s ease" }} />
          </div>
        )}

        <br />
        <button onClick={handleUpload} disabled={uploading || analyzing} style={{ marginTop: "16px" }}>
          {uploading ? `Uploading... ${progress}%` : analyzing ? "Analyzing..." : "Upload & Review"}
        </button>
      </div>

      {analysis && (
        <div style={{ marginTop: "32px", maxWidth: "700px" }}>
          <h3>Analysis Results — {analysis.filename}</h3>

          <div style={{
            display: "inline-block",
            padding: "12px 24px",
            borderRadius: "8px",
            background: scoreColor(analysis.quality_score),
            color: "#fff",
            fontSize: "20px",
            fontWeight: "bold",
            marginBottom: "20px"
          }}>
            Overall Score: {analysis.quality_score} / 10
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div style={cardStyle}>
              <h4>📋 Code Quality (Pylint)</h4>
              <p>Score: {analysis.analysis.pylint.score} / 10</p>
              <p>Total Issues: {analysis.analysis.pylint.total_issues}</p>
              <p>Warnings: {analysis.analysis.pylint.warnings}</p>
              <p>Conventions: {analysis.analysis.pylint.conventions}</p>
            </div>

            <div style={cardStyle}>
              <h4>🔒 Security (Bandit)</h4>
              <p>Total Issues: {analysis.analysis.bandit.total_issues}</p>
              <p style={{ color: "#dc2626" }}>High: {analysis.analysis.bandit.high}</p>
              <p style={{ color: "#ca8a04" }}>Medium: {analysis.analysis.bandit.medium}</p>
              <p style={{ color: "#16a34a" }}>Low: {analysis.analysis.bandit.low}</p>
            </div>

            <div style={cardStyle}>
              <h4>🧩 Complexity (Radon)</h4>
              <p>Total Functions: {analysis.analysis.radon.total_functions}</p>
              <p>Avg Complexity: {analysis.analysis.radon.avg_complexity}</p>
            </div>

            <div style={cardStyle}>
              <h4>🛠 Maintainability</h4>
              <p>Index: {analysis.analysis.radon.maintainability_index ?? "N/A"} / 100</p>
            </div>
          </div>

          {analysis.analysis.bandit.issues.length > 0 && (
            <div style={{ marginTop: "20px" }}>
              <h4>Security Issues Found:</h4>
              {analysis.analysis.bandit.issues.map((issue, i) => (
                <div key={i} style={{
                  padding: "10px",
                  borderLeft: `4px solid ${issue.severity === "HIGH" ? "#dc2626" : issue.severity === "MEDIUM" ? "#ca8a04" : "#16a34a"}`,
                  background: "#f9f9f9",
                  marginBottom: "8px"
                }}>
                  <strong>{issue.severity}</strong> (Line {issue.line}): {issue.issue}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}

const cardStyle = {
  padding: "16px",
  border: "1px solid #ddd",
  borderRadius: "8px",
  background: "#fff",
};

export default Upload;
