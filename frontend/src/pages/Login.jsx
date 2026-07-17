import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import { Sparkles, ShieldCheck, Code2, Gauge, FileDown } from "lucide-react";

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
    <div style={{ minHeight: "100vh", display: "flex", background: "var(--bg)" }}>
      <div style={{
        flex: 1, display: "flex", flexDirection: "column", justifyContent: "center",
        padding: "60px", maxWidth: "560px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "24px" }}>
          <Sparkles size={26} color="var(--primary)" />
          <h2 style={{ margin: 0 }}>Observer AI</h2>
        </div>
        <h1 style={{ fontSize: "42px", lineHeight: 1.15, margin: 0 }}>
          Review Smarter.<br />Code Better.
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "16px", marginTop: "16px" }}>
          AI-powered code reviews for Python and C — catch bugs, security risks, and performance issues in seconds.
        </p>
        <div style={{ marginTop: "28px", display: "flex", flexDirection: "column", gap: "14px" }}>
          <Feature icon={Code2} text="Python & C static analysis" />
          <Feature icon={ShieldCheck} text="Security vulnerability scanning" />
          <Feature icon={Gauge} text="Complexity & maintainability metrics" />
          <Feature icon={FileDown} text="AI-powered review reports" />
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="fade-in" style={{
          background: "var(--card)", border: "1px solid var(--border)",
          borderRadius: "16px", padding: "40px", width: "380px",
        }}>
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
    </div>
  );
}

function Feature({ icon: Icon, text }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <div style={{
        width: "32px", height: "32px", borderRadius: "8px",
        background: "rgba(59,130,246,0.15)", display: "flex",
        alignItems: "center", justifyContent: "center",
      }}>
        <Icon size={16} color="var(--primary)" />
      </div>
      <span style={{ fontSize: "14px", color: "var(--text)" }}>{text}</span>
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
