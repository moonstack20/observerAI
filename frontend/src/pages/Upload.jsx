import { useState } from "react";
import Layout from "../components/Layout";

function Upload() {
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = () => {
    if (!file) {
      alert("Please select a Python file first");
      return;
    }
    alert(`Ready to upload: ${file.name} (actual upload logic comes tomorrow)`);
  };

  return (
    <Layout>
      <h2>Upload Code</h2>
      <p>Upload a Python file to get an AI-powered code review.</p>

      <div style={{
        border: "2px dashed #ccc",
        borderRadius: "8px",
        padding: "40px",
        textAlign: "center",
        marginTop: "24px",
        maxWidth: "500px"
      }}>
        <input type="file" accept=".py" onChange={handleFileChange} />
        {file && <p style={{ marginTop: "12px" }}>Selected: {file.name}</p>}
        <br />
        <button onClick={handleUpload} style={{ marginTop: "16px" }}>
          Upload & Review
        </button>
      </div>
    </Layout>
  );
}

export default Upload;
