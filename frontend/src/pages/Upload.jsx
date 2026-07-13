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
  const [mode, setMode] = useState("upload"); // "upload" or "paste"
  const [file, setFile] = useState(null);
  const [pastedCode, setPastedCode] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [analysis, setAnalysis] = useState(null);

  const switchMode = (newMode) => {
    setMode(newMode);
    setFile(null);
    setPastedCode("");
    setError("");
    setAnalysis(null);
    setProgress(0);
  };

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

  const runAnalysis = async (reviewId, token) => {
    setAnalyzing(true);
    const analyzeRes = await api.post(`/analyze/${reviewId}`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setAnalysis(analyzeRes.data.review);
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

      setUploading(false);
      await runAnalysis(uploadRes.data.review.id, token);
      setFile(null);
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    } finally {
      setUploading(false);
      setAnalyzing(false);
    }
  };

  const handlePasteSubmit = async () => {
    if (!pastedCode.trim()) {
      setError("Please paste some code first");
      return;
    }

    setError("");
    setAnalysis(null);
    setUploading(true);

    try {
      const token = localStorage.getItem("token");
      const pasteRes = await api.post("/paste", { code: pastedCode }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUploading(false);
      await runAnalysis(pasteRes.data.review.id, token);
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
      <p>Upload a file or paste code directly to get an AI-powered code review.</p>

      <div style={{ display: "flex", gap: "8px", marginTop: "20px", maxWidth: "500px" }}>
        <button
          onClick={() => switchMode("upload")}
          style={{
            flex: 1,
            padding: "10px",
            background: mode === "upload" ? "#4f46e5" : "#eee",
            color: mode === "upload" ? "#fff" : "#333",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          📁 Upload File
        </button>
        <button
          onClick={() => switchMode("paste")}
          style={{
            flex: 1,
            padding: "10px",
            background: mode === "paste" ? "#4f46e5" : "#eee",
            color: mode === "paste" ? "#fff" : "#333",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          📋 Paste Code
        </button>
      </div>

      {mode === "upload" ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          style={{
            border: `2px dashed ${isDragging ? "#4f46e5" : "#ccc"}`,
            borderRadius: "8px",
            padding: "40px",
            textAlign: "center",
            marginTop: "16px",
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
      ) : (
        <div style={{ marginTop: "16px", maxWidth: "600px" }}>
          <textarea
            value={pastedCode}
            onChange={(e) => setPastedCode(e.target.value)}
            placeholder="Paste your Python or C code here..."
            rows={14}
            style={{
              width: "100%",
              fontFamily: "monospace",
              fontSize: "13px",
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              resize: "vertical",
            }}
          />
          <br />
          <button onClick={handlePasteSubmit} disabled={uploading || analyzing} style={{ marginTop: "12px" }}>
            {uploading ? "Submitting..." : analyzing ? "Analyzing..." : "Analyze Code"}
          </button>
        </div>
      )}

      {error && <p style={{ color: "red", marginTop: "12px" }}>{error}</p>}

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

          {analysis.language === "python" ? (
            <PythonResults data={analysis.analysis} />
          ) : (
            <CResults data={analysis.analysis} />
          )}
          <AIReview ai={analysis.analysis.ai_review} />
        </div>
      )}
    </Layout>
  );
}

function PythonResults({ data }) {
  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        <div style={cardStyle}>
          <h4>📋 Code Quality (Pylint)</h4>
          <p>Score: {data.pylint.score} / 10</p>
          <p>Total Issues: {data.pylint.total_issues}</p>
          <p>Warnings: {data.pylint.warnings}</p>
          <p>Conventions: {data.pylint.conventions}</p>
        </div>

        <div style={cardStyle}>
          <h4>🔒 Security (Bandit)</h4>
          <p>Total Issues: {data.bandit.total_issues}</p>
          <p style={{ color: "#dc2626" }}>High: {data.bandit.high}</p>
          <p style={{ color: "#ca8a04" }}>Medium: {data.bandit.medium}</p>
          <p style={{ color: "#16a34a" }}>Low: {data.bandit.low}</p>
        </div>

        <div style={cardStyle}>
          <h4>🧩 Complexity (Radon)</h4>
          <p>Total Functions: {data.radon.total_functions}</p>
          <p>Avg Complexity: {data.radon.avg_complexity}</p>
        </div>

        <div style={cardStyle}>
          <h4>🛠 Maintainability</h4>
          <p>Index: {data.radon.maintainability_index ?? "N/A"} / 100</p>
        </div>
      </div>

      {data.bandit.issues.length > 0 && (
        <IssueList title="Security Issues Found:" issues={data.bandit.issues.map(i => ({
          severity: i.severity, line: i.line, message: i.issue
        }))} />
      )}
    </>
  );
}

function CResults({ data }) {
  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        <div style={cardStyle}>
          <h4>📋 Code Quality (Cppcheck)</h4>
          <p>Total Issues: {data.cppcheck.total_issues}</p>
          <p>Errors: {data.cppcheck.errors}</p>
          <p>Warnings: {data.cppcheck.warnings}</p>
          <p>Style: {data.cppcheck.style}</p>
        </div>

        <div style={cardStyle}>
          <h4>🔒 Security (Flawfinder)</h4>
          <p>Total Issues: {data.flawfinder.total_issues}</p>
          <p style={{ color: "#dc2626" }}>High Risk: {data.flawfinder.high_risk}</p>
          <p style={{ color: "#ca8a04" }}>Medium Risk: {data.flawfinder.medium_risk}</p>
          <p style={{ color: "#16a34a" }}>Low Risk: {data.flawfinder.low_risk}</p>
        </div>

        <div style={cardStyle}>
          <h4>🧩 Complexity (Lizard)</h4>
          <p>Total Functions: {data.lizard.total_functions}</p>
          <p>Avg Complexity: {data.lizard.avg_complexity}</p>
        </div>

        <div style={cardStyle}>
          <h4>📏 Size</h4>
          <p>Total Lines: {data.lizard.total_lines}</p>
        </div>
      </div>

      {data.flawfinder.issues.length > 0 && (
        <IssueList
          title="Security Issues Found:"
          issues={data.flawfinder.issues.map(i => ({
            severity: i.risk_level >= 4 ? "HIGH" : i.risk_level >= 2 ? "MEDIUM" : "LOW",
            line: i.line,
            message: i.message
          }))}
        />
      )}
    </>
  );
}

function AIReview({ ai }) {
    if (!ai || ai.error) {
      return (
        <div style={{ marginTop: "24px", padding: "16px", background: "#fff3cd", borderRadius: "8px" }}>
          <p>AI review unavailable{ai?.error ? `: ${ai.error}` : ""}</p>
        </div>
      );
    }
  
    const categories = Object.entries(ai).filter(([key, val]) =>
      Array.isArray(val) && val.length > 0 && key !== "best_practices" && key !== "refactoring_suggestions"
    );
  
    return (
      <div style={{ marginTop: "32px" }}>
        <h3>🤖 AI Code Review</h3>
  
        <div style={{
          padding: "16px",
          background: "#f0f0ff",
          borderRadius: "8px",
          marginBottom: "16px"
        }}>
          <p style={{ margin: 0 }}><strong>AI Score:</strong> {ai.overall_ai_score} / 10</p>
          <p style={{ marginTop: "8px", marginBottom: 0 }}>{ai.summary}</p>
        </div>
  
        {categories.map(([key, items]) => (
          <div key={key} style={{ marginBottom: "16px" }}>
            <h4 style={{ textTransform: "capitalize" }}>{key.replace(/_/g, " ")}</h4>
            {items.map((item, i) => (
              <div key={i} style={{
                padding: "10px",
                borderLeft: `4px solid ${item.severity === "high" ? "#dc2626" : item.severity === "medium" ? "#ca8a04" : "#16a34a"}`,
                background: "#f9f9f9",
                marginBottom: "8px"
              }}>
                {item.line && <strong>Line {item.line}: </strong>}
                {item.description}
                {item.severity && <span style={{ marginLeft: "8px", fontSize: "12px", opacity: 0.7 }}>({item.severity})</span>}
              </div>
            ))}
          </div>
        ))}
  
        {ai.refactoring_suggestions && ai.refactoring_suggestions.length > 0 && (
          <div style={{ marginBottom: "16px" }}>
            <h4>💡 Refactoring Suggestions</h4>
            {ai.refactoring_suggestions.map((item, i) => (
              <div key={i} style={{ padding: "10px", background: "#f9f9f9", marginBottom: "8px", borderRadius: "6px" }}>
                <p style={{ margin: 0 }}>{item.description}</p>
                {item.suggestion && (
                  <pre style={{ background: "#eee", padding: "8px", borderRadius: "4px", marginTop: "6px", fontSize: "12px", overflowX: "auto" }}>
                    {item.suggestion}
                  </pre>
                )}
              </div>
            ))}
          </div>
        )}
  
        {ai.best_practices && ai.best_practices.length > 0 && (
          <div>
            <h4>✅ Best Practices</h4>
            {ai.best_practices.map((item, i) => (
              <div key={i} style={{ padding: "10px", background: "#f9f9f9", marginBottom: "8px", borderRadius: "6px" }}>
                {item.description}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

function IssueList({ title, issues }) {
  return (
    <div style={{ marginTop: "20px" }}>
      <h4>{title}</h4>
      {issues.map((issue, i) => (
        <div key={i} style={{
          padding: "10px",
          borderLeft: `4px solid ${issue.severity === "HIGH" ? "#dc2626" : issue.severity === "MEDIUM" ? "#ca8a04" : "#16a34a"}`,
          background: "#f9f9f9",
          marginBottom: "8px"
        }}>
          <strong>{issue.severity}</strong> (Line {issue.line}): {issue.message}
        </div>
      ))}
    </div>
  );
}

const cardStyle = {
  padding: "16px",
  border: "1px solid #ddd",
  borderRadius: "8px",
  background: "#fff",
};

export default Upload;
