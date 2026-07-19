import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import { Sparkles, Check, X, Eye, EyeOff } from "lucide-react";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
  const allValid = Object.values(checks).every(Boolean);

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!allValid) {
      setError("Please meet all password requirements");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/register", { name, email, password });
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
      <div className="fade-in" style={{
        background: "var(--card)", border: "1px solid var(--border)",
        borderRadius: "16px", padding: "40px", width: "420px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "24px" }}>
          <Sparkles size={24} color="var(--primary)" />
          <h2 style={{ margin: 0 }}>Observer AI</h2>
        </div>
        <h3 style={{ marginBottom: "4px" }}>Create an account</h3>
        <p style={{ color: "var(--text-muted)", marginTop: 0, fontSize: "14px" }}>Start reviewing your code with AI</p>
        {error && <p style={{ color: "var(--error)", fontSize: "14px" }}>{error}</p>}
        <form onSubmit={handleSubmit}>
        <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => {
              const val = e.target.value;
              if (/^[A-Za-z\s]*$/.test(val)) setName(val);
            }}
            required
            style={inputStyle}
          />
          <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px", marginBottom: 0 }}>
            Please enter a valid name (letters only, no numbers or symbols)
          </p>
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} />
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ ...inputStyle, paddingRight: "40px" }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute", right: "10px", top: "50%", transform: "translateY(-6px)",
                background: "transparent", border: "none", cursor: "pointer", padding: "4px",
                color: "var(--text-muted)",
              }}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {password.length > 0 && (
            <div style={{ marginTop: "10px", padding: "10px 12px", background: "var(--bg)", borderRadius: "8px", border: "1px solid var(--border)" }}>
              <PasswordRule valid={checks.length} text="At least 8 characters" />
              <PasswordRule valid={checks.uppercase} text="One uppercase letter" />
              <PasswordRule valid={checks.lowercase} text="One lowercase letter" />
              <PasswordRule valid={checks.number} text="One number" />
              <PasswordRule valid={checks.special} text="One special character" />
            </div>
          )}

<button type="submit" disabled={!allValid || loading} style={{ ...btnStyle, opacity: (allValid && !loading) ? 1 : 0.5, cursor: (allValid && !loading) ? "pointer" : "not-allowed" }}>
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>
        <p style={{ fontSize: "14px", color: "var(--text-muted)", marginTop: "16px" }}>
          Already have an account? <Link to="/login" style={{ color: "var(--primary)" }}>Log In</Link>
        </p>
      </div>
    </div>
  );
}

function PasswordRule({ valid, text }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: valid ? "var(--success)" : "var(--text-muted)", marginBottom: "4px" }}>
      {valid ? <Check size={14} /> : <X size={14} />}
      {text}
    </div>
  );
}

const inputStyle = {
  width: "100%", padding: "12px", marginTop: "12px",
  background: "var(--bg)", border: "1px solid var(--border)",
  borderRadius: "8px", color: "var(--text)", fontSize: "14px",
};
const btnStyle = {
  width: "100%", padding: "12px", marginTop: "16px",
  background: "var(--primary)", border: "none", borderRadius: "8px",
  color: "#fff", fontWeight: 600, fontSize: "14px",
};

export default Register;
