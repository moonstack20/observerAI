import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import api from "../services/api";
import { UploadCloud, FileCode, ClipboardList, ShieldAlert, Puzzle, Wrench, Sparkles, Lightbulb, CheckCircle2, FileDown } from "lucide-react";

const ALLOWED_EXTENSIONS = [".py", ".c", ".h"];

function detectLanguageLabel(filename) {
  const ext = filename.slice(filename.lastIndexOf(".")).toLowerCase();
  if (ext === ".py") return "Python";
  if (ext === ".c" || ext === ".h") return "C";
  return null;
}

function scoreColor(score) {
  if (score >= 8) return "var(--success)";
  if (score >= 5) return "var(--warning)";
  return "var(--error)";
}

function Upload() {
  const [mode, setMode] = useState("upload");
  const [file, setFile] = useState(null);
  const [pastedCode, setPastedCode] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [analysis, setAnalysis] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

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
        headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
        onUploadProgress: (e) => setProgress(Math.round((e.loaded * 100) / e.total)),
      });
      setUploading(false);
      await runAnalysis(uploadRes.data.review.id, token);
      setFile(null);
      showToast("Analysis complete! Your report is ready.", "success");
    } catch (err) {
      const msg = err.response?.data?.error || "Something went wrong";
      setError(msg);
      showToast(msg, "error");
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
      showToast("Analysis complete! Your report is ready.", "success");
    } catch (err) {
      const msg = err.response?.data?.error || "Something went wrong";
      setError(msg);
      showToast(msg, "error");
    } finally {
      setUploading(false);
      setAnalyzing(false);
    }
  };

  return (
    <Layout>
      <Toast toast={toast} />

      <h2 style={{ margin: 0 }}>Upload Code</h2>
      <p style={{ color: "var(--text-muted)" }}>Upload a file or paste code directly to get an AI-powered code review.</p>

      <div style={{ display: "flex", gap: "8px", marginTop: "20px", maxWidth: "600px" }}>
        <ToggleButton active={mode === "upload"} onClick={() => switchMode("upload")} icon={UploadCloud} label="Upload File" />
        <ToggleButton active={mode === "paste"} onClick={() => switchMode("paste")} icon={FileCode} label="Paste Code" />
      </div>

      {mode === "upload" ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          style={{
            border: `2px dashed ${isDragging ? "var(--primary)" : "var(--border)"}`,
            borderRadius: "12px", padding: "48px", textAlign: "center",
            marginTop: "16px", maxWidth: "600px",
            background: isDragging ? "rgba(59,130,246,0.08)" : "var(--card)",
            transition: "all 0.15s ease",
          }}
        >
          <UploadCloud size={32} color="var(--text-muted)" style={{ marginBottom: "8px" }} />
          <p style={{ color: "var(--text-muted)" }}>Drag & drop a .py, .c, or .h file here, or</p>
          <label style={{
            display: "inline-block", padding: "10px 20px", background: "var(--primary)",
            borderRadius: "8px", cursor: "pointer", fontWeight: 500, fontSize: "14px",
          }}>
            Choose File
            <input type="file" accept=".py,.c,.h" onChange={handleFileChange} style={{ display: "none" }} />
          </label>

          {file && <FileSummaryCard file={file} />}

          {uploading && <ProgressBar progress={progress} />}

          <br />
          <button onClick={handleUpload} disabled={uploading || analyzing} style={primaryBtn}>
            {uploading ? `Uploading... ${progress}%` : analyzing ? "Analyzing..." : "Upload & Review"}
          </button>
          {analyzing && <AnalyzingIndicator />}
        </div>
      ) : (
        <div style={{ marginTop: "16px", maxWidth: "700px" }}>
          <textarea
            value={pastedCode}
            onChange={(e) => setPastedCode(e.target.value)}
            placeholder="Paste your Python or C code here..."
            rows={14}
            style={{
              width: "100%", fontFamily: "'Fira Code', monospace", fontSize: "13px",
              padding: "16px", borderRadius: "12px", border: "1px solid var(--border)",
              background: "var(--card)", color: "var(--text)", resize: "vertical",
            }}
          />
          <br />
          <button onClick={handlePasteSubmit} disabled={uploading || analyzing} style={primaryBtn}>
            {uploading ? "Submitting..." : analyzing ? "Analyzing..." : "Analyze Code"}
          </button>
          {analyzing && <AnalyzingIndicator />}
        </div>
      )}

      {error && <p style={{ color: "var(--error)", marginTop: "12px" }}>{error}</p>}

      {analysis && (
        <div className="fade-in" style={{ marginTop: "32px", maxWidth: "800px" }}>
          <h3>Analysis Results — {analysis.filename}</h3>

          <SummaryBar analysis={analysis} />

          <DownloadButtons reviewId={analysis.id} />

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

function ToggleButton({ active, onClick, icon: Icon, label }) {
  return (
    <button onClick={onClick} style={{
      flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
      padding: "12px", background: active ? "var(--primary)" : "var(--card)",
      color: active ? "#fff" : "var(--text-muted)",
      border: `1px solid ${active ? "var(--primary)" : "var(--border)"}`,
      borderRadius: "8px", fontSize: "14px", fontWeight: 500,
    }}>
      <Icon size={16} /> {label}
    </button>
  );
}

function ProgressBar({ progress }) {
  return (
    <div style={{ marginTop: "16px", background: "var(--border)", borderRadius: "6px", overflow: "hidden", height: "8px" }}>
      <div style={{ width: `${progress}%`, background: "var(--primary)", height: "100%", transition: "width 0.2s ease" }} />
    </div>
  );
}

function FileSummaryCard({ file }) {
  const [lines, setLines] = useState(null);

  useEffect(() => {
    file.text().then((text) => setLines(text.split("\n").length));
  }, [file]);

  const sizeKB = (file.size / 1024).toFixed(1);

  return (
    <div style={{
      marginTop: "16px", padding: "14px 18px", background: "var(--bg)",
      border: "1px solid var(--border)", borderRadius: "10px", textAlign: "left",
    }}>
      <p style={{ margin: 0, fontWeight: 600 }}>📄 {file.name}</p>
      <div style={{ display: "flex", gap: "20px", marginTop: "8px", fontSize: "13px", color: "var(--text-muted)" }}>
        <span>Language: <strong style={{ color: "var(--text)" }}>{detectLanguageLabel(file.name)}</strong></span>
        <span>Size: <strong style={{ color: "var(--text)" }}>{sizeKB} KB</strong></span>
        <span>Lines: <strong style={{ color: "var(--text)" }}>{lines ?? "..."}</strong></span>
        <span style={{ color: "var(--success)" }}>● Ready</span>
      </div>
    </div>
  );
}

function AnalyzingIndicator() {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "10px",
      marginTop: "16px", padding: "12px 16px",
      background: "var(--card)", border: "1px solid var(--border)",
      borderRadius: "8px", color: "var(--text-muted)", fontSize: "14px",
    }}>
      <div className="spinner" style={{
        width: "16px", height: "16px", border: "2px solid var(--border)",
        borderTopColor: "var(--primary)", borderRadius: "50%",
      }} />
      AI is reviewing your code — this can take up to 30 seconds...
    </div>
  );
}

function Toast({ toast }) {
  if (!toast) return null;
  const isSuccess = toast.type === "success";
  const accent = isSuccess ? "var(--success)" : "var(--error)";
  return (
    <div className="fade-in" style={{
      position: "fixed", top: "20px", right: "20px", zIndex: 1000,
      padding: "14px 20px", borderRadius: "10px",
      background: "#fff",
      borderLeft: `4px solid ${accent}`,
      color: "#1E293B", fontWeight: 500, fontSize: "14px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
    }}>
      {toast.message}
    </div>
  );
}

function SummaryBar({ analysis }) {
  const ai = analysis.analysis.ai_review;
  const highCount = ai && !ai.error
    ? Object.values(ai).filter(Array.isArray).flat().filter(i => i.severity === "high").length
    : 0;
  const warningCount = ai && !ai.error
    ? Object.values(ai).filter(Array.isArray).flat().filter(i => i.severity === "medium" || i.severity === "low").length
    : 0;
  const verdict = analysis.quality_score >= 8 ? "Good" : analysis.quality_score >= 5 ? "Needs Improvement" : "Poor";

  return (
    <div style={{
      display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "16px",
    }}>
      <SummaryStat label="Overall Score" value={`${analysis.quality_score} / 10`} color={scoreColor(analysis.quality_score)} />
      <SummaryStat label="High Issues" value={highCount} color="var(--error)" />
      <SummaryStat label="Warnings" value={warningCount} color="var(--warning)" />
      <SummaryStat label="AI Verdict" value={verdict} color="var(--primary)" />
    </div>
  );
}

function SummaryStat({ label, value, color }) {
  return (
    <div style={{
      background: "var(--card)", border: `1px solid ${color}`, borderRadius: "12px",
      padding: "16px", textAlign: "center",
    }}>
      <p style={{ margin: 0, fontSize: "12px", color: "var(--text-muted)" }}>{label}</p>
      <p style={{ margin: "6px 0 0 0", fontSize: "20px", fontWeight: 700, color }}>{value}</p>
    </div>
  );
}

function DownloadButtons({ reviewId }) {
  const download = async (type) => {
    const token = localStorage.getItem("token");
    const res = await api.get(`/report/${reviewId}/${type}`, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: "blob",
    });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `report.${type === "pdf" ? "pdf" : "md"}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
      <button onClick={() => download("pdf")} style={downloadBtn}>
        <FileDown size={14} style={{ marginRight: "6px", verticalAlign: "middle" }} />
        Download PDF
      </button>
      <button onClick={() => download("markdown")} style={downloadBtn}>
        <FileDown size={14} style={{ marginRight: "6px", verticalAlign: "middle" }} />
        Download Markdown
      </button>
    </div>
  );
}

const downloadBtn = {
  padding: "8px 16px", background: "var(--card)", border: "1px solid var(--border)",
  borderRadius: "8px", color: "var(--text)", fontSize: "13px", fontWeight: 500,
};

function MetricCard({ icon: Icon, title, children }) {
  return (
    <div className="hover-card" style={{
      background: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px", padding: "18px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
        <Icon size={18} color="var(--primary)" />
        <h4 style={{ margin: 0, fontSize: "15px" }}>{title}</h4>
      </div>
      <div style={{ color: "var(--text-muted)", fontSize: "14px", lineHeight: "1.8" }}>{children}</div>
    </div>
  );
}

function PythonResults({ data }) {
  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        <MetricCard icon={ClipboardList} title="Code Quality (Pylint)">
          <p>Score: {data.pylint.score} / 10</p>
          <p>Total Issues: {data.pylint.total_issues}</p>
          <p>Warnings: {data.pylint.warnings}</p>
          <p>Conventions: {data.pylint.conventions}</p>
        </MetricCard>
        <MetricCard icon={ShieldAlert} title="Security (Bandit)">
          <p>Total Issues: {data.bandit.total_issues}</p>
          <p style={{ color: "var(--error)" }}>High: {data.bandit.high}</p>
          <p style={{ color: "var(--warning)" }}>Medium: {data.bandit.medium}</p>
          <p style={{ color: "var(--success)" }}>Low: {data.bandit.low}</p>
        </MetricCard>
        <MetricCard icon={Puzzle} title="Complexity (Radon)">
          <p>Total Functions: {data.radon.total_functions}</p>
          <p>Avg Complexity: {data.radon.avg_complexity}</p>
        </MetricCard>
        <MetricCard icon={Wrench} title="Maintainability">
          <p>Index: {data.radon.maintainability_index ?? "N/A"} / 100</p>
        </MetricCard>
      </div>
      {data.bandit.issues.length > 0 && (
        <IssueList title="Security Issues Found" issues={data.bandit.issues.map(i => ({
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
        <MetricCard icon={ClipboardList} title="Code Quality (Cppcheck)">
          <p>Total Issues: {data.cppcheck.total_issues}</p>
          <p>Errors: {data.cppcheck.errors}</p>
          <p>Warnings: {data.cppcheck.warnings}</p>
          <p>Style: {data.cppcheck.style}</p>
        </MetricCard>
        <MetricCard icon={ShieldAlert} title="Security (Flawfinder)">
          <p>Total Issues: {data.flawfinder.total_issues}</p>
          <p style={{ color: "var(--error)" }}>High Risk: {data.flawfinder.high_risk}</p>
          <p style={{ color: "var(--warning)" }}>Medium Risk: {data.flawfinder.medium_risk}</p>
          <p style={{ color: "var(--success)" }}>Low Risk: {data.flawfinder.low_risk}</p>
        </MetricCard>
        <MetricCard icon={Puzzle} title="Complexity (Lizard)">
          <p>Total Functions: {data.lizard.total_functions}</p>
          <p>Avg Complexity: {data.lizard.avg_complexity}</p>
        </MetricCard>
        <MetricCard icon={Wrench} title="Size">
          <p>Total Lines: {data.lizard.total_lines}</p>
        </MetricCard>
      </div>
      {data.flawfinder.issues.length > 0 && (
        <IssueList title="Security Issues Found" issues={data.flawfinder.issues.map(i => ({
          severity: i.risk_level >= 4 ? "HIGH" : i.risk_level >= 2 ? "MEDIUM" : "LOW",
          line: i.line, message: i.message
        }))} />
      )}
    </>
  );
}

function IssueList({ title, issues }) {
  const color = (s) => s === "HIGH" ? "var(--error)" : s === "MEDIUM" ? "var(--warning)" : "var(--success)";
  return (
    <div style={{ marginTop: "20px" }}>
      <h4>{title}</h4>
      {issues.map((issue, i) => (
        <div key={i} style={{
          padding: "12px", borderLeft: `4px solid ${color(issue.severity)}`,
          background: "var(--card)", marginBottom: "8px", borderRadius: "0 8px 8px 0",
        }}>
          <strong style={{ color: color(issue.severity) }}>{issue.severity}</strong>{" "}
          <span style={{ color: "var(--text-muted)" }}>(Line {issue.line}):</span> {issue.message}
        </div>
      ))}
    </div>
  );
}

function AIReview({ ai }) {
  if (!ai || ai.error) {
    return (
      <div style={{ marginTop: "24px", padding: "16px", background: "var(--card)", borderRadius: "8px", border: "1px solid var(--warning)" }}>
        <p style={{ margin: 0 }}>AI review unavailable{ai?.error ? `: ${ai.error}` : ""}</p>
      </div>
    );
  }

  const categories = Object.entries(ai).filter(([key, val]) =>
    Array.isArray(val) && val.length > 0 && key !== "best_practices" && key !== "refactoring_suggestions"
  );
  const color = (s) => s === "high" ? "var(--error)" : s === "medium" ? "var(--warning)" : "var(--success)";

  return (
    <div style={{ marginTop: "32px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
        <Sparkles size={20} color="var(--primary)" />
        <h3 style={{ margin: 0 }}>AI Code Review</h3>
      </div>

      <div style={{ padding: "18px", background: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px", marginBottom: "16px" }}>
        <p style={{ margin: 0, fontWeight: 600 }}>AI Score: {ai.overall_ai_score} / 10</p>
        <p style={{ marginTop: "8px", marginBottom: 0, color: "var(--text-muted)" }}>{ai.summary}</p>
      </div>

      {categories.map(([key, items]) => (
        <div key={key} style={{ marginBottom: "16px" }}>
          <h4 style={{ textTransform: "capitalize" }}>{key.replace(/_/g, " ")}</h4>
          {items.map((item, i) => (
            <div key={i} style={{
              padding: "12px", borderLeft: `4px solid ${color(item.severity)}`,
              background: "var(--card)", marginBottom: "8px", borderRadius: "0 8px 8px 0",
            }}>
              {item.line && <strong>Line {item.line}: </strong>}
              <span style={{ color: "var(--text-muted)" }}>{item.description}</span>
              {item.severity && <span style={{ marginLeft: "8px", fontSize: "12px", color: color(item.severity) }}>({item.severity})</span>}
            </div>
          ))}
        </div>
      ))}

      {ai.refactoring_suggestions?.length > 0 && (
        <div style={{ marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Lightbulb size={16} color="var(--warning)" />
            <h4 style={{ margin: 0 }}>Refactoring Suggestions</h4>
          </div>
          {ai.refactoring_suggestions.map((item, i) => (
            <div key={i} style={{ padding: "12px", background: "var(--card)", border: "1px solid var(--border)", marginTop: "8px", borderRadius: "8px" }}>
              <p style={{ margin: 0, color: "var(--text-muted)" }}>{item.description}</p>
              {item.suggestion && (
                <pre style={{ background: "var(--bg)", padding: "10px", borderRadius: "6px", marginTop: "8px", fontSize: "12px", overflowX: "auto", border: "1px solid var(--border)" }}>
                  {item.suggestion}
                </pre>
              )}
            </div>
          ))}
        </div>
      )}

      {ai.best_practices?.length > 0 && (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <CheckCircle2 size={16} color="var(--success)" />
            <h4 style={{ margin: 0 }}>Best Practices</h4>
          </div>
          {ai.best_practices.map((item, i) => (
            <div key={i} style={{ padding: "12px", background: "var(--card)", border: "1px solid var(--border)", marginTop: "8px", borderRadius: "8px", color: "var(--text-muted)" }}>
              {item.description}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const primaryBtn = {
  marginTop: "16px", padding: "12px 24px", background: "var(--primary)",
  border: "none", borderRadius: "8px", color: "#fff", fontWeight: 600, fontSize: "14px",
};

export default Upload;
