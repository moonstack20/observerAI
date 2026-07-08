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

function Upload() {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);

  const validateAndSetFile = (selectedFile) => {
    setError("");
    setResult(null);
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

    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = localStorage.getItem("token");
      const res = await api.post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(percent);
        },
      });
      setResult(res.data.review);
      setFile(null);
    } catch (err) {
      setError(err.response?.data?.error || "Upload failed");
    } finally {
      setUploading(false);
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
            <span style={{ color: "#4f46e5" }}>
              ({detectLanguageLabel(file.name)})
            </span>
          </p>
        )}

        {error && <p style={{ color: "red", marginTop: "8px" }}>{error}</p>}

        {uploading && (
          <div style={{
            marginTop: "16px",
            background: "#eee",
            borderRadius: "6px",
            overflow: "hidden",
            height: "10px",
          }}>
            <div style={{
              width: `${progress}%`,
              background: "#4f46e5",
              height: "100%",
              transition: "width 0.2s ease",
            }} />
          </div>
        )}
        {uploading && <p style={{ fontSize: "13px", marginTop: "4px" }}>{progress}%</p>}

        <br />
        <button onClick={handleUpload} disabled={uploading} style={{ marginTop: "16px" }}>
          {uploading ? `Uploading... ${progress}%` : "Upload & Review"}
        </button>
      </div>

      {result && (
        <div style={{
          marginTop: "24px",
          padding: "16px",
          border: "1px solid #4f46e5",
          borderRadius: "8px",
          maxWidth: "500px",
          background: "#f8f8ff"
        }}>
          <h4>✅ Upload Successful</h4>
          <p><strong>File:</strong> {result.filename}</p>
          <p><strong>Language:</strong> {result.language === "python" ? "Python" : "C"}</p>
          <p><strong>Status:</strong> {result.status}</p>
        </div>
      )}
    </Layout>
  );
}

export default Upload;
