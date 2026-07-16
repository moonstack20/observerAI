import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import { Sparkles } from "lucide-react";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.access_token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
      <div className="fade-in" style={{
        background: "var(--card)", border: "1px solid var(--border)",
        borderRadius: "16px", padding: "40px", width: "380px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "24px" }}>
          <Sparkles size={24} color="var(--primary)" />
          <h2 style={{ margin: 0 }}>observerAI</h2>
        </div>
        <h3 style={{ marginBottom: "4px" }}>Welcome back</h3>
        <p style={{ color: "var(--text-muted)", marginTop: 0, fontSize: "14px" }}>Log in to review your code</p>
        {error && <p style={{ color: "var(--error)", fontSize: "14px" }}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={inputStyle} />
          <button type="submit" style={btnStyle}>Log In</button>
        </form>
        <p style={{ fontSize: "14px", color: "var(--text-muted)", marginTop: "16px" }}>
          Don't have an account? <Link to="/register" style={{ color: "var(--primary)" }}>Register</Link>
        </p>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%", padding: "12px", marginTop: "12px",
  background: "var(--bg)", border: "1px solid var(--border)",
  borderRadius: "8px", color: "var(--text)", fontSize: "14px",
};
const btnStyle = {
  width: "100%", padding: "12px", marginTop: "20px",
  background: "var(--primary)", border: "none", borderRadius: "8px",
  color: "#fff", fontWeight: 600, fontSize: "14px",
};

export default Login;
