import { useNavigate } from "react-router-dom";
import { Sparkles, Code2, ShieldCheck, Gauge, FileDown, ArrowRight } from "lucide-react";

function Landing() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "24px 48px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Sparkles size={22} color="var(--primary)" />
          <h3 style={{ margin: 0, fontWeight: 600 }}>Observer AI</h3>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <button onClick={() => navigate("/login")} style={ghostBtn}>Login</button>
          <button onClick={() => navigate("/register")} style={primaryBtn}>Get Started</button>
        </div>
      </div>

      <div style={{
        background: "linear-gradient(135deg, #4338CA 0%, #3B82F6 60%, #22D3EE 100%)",
        borderRadius: "24px", margin: "24px 48px", padding: "80px 60px",
        textAlign: "center",
      }}>
        <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "14px", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "12px" }}>
          AI-Powered Code Review Platform
        </p>
        <h1 style={{ color: "#fff", fontSize: "56px", lineHeight: 1.1, margin: "0 auto", maxWidth: "800px" }}>
          Review Smarter.<br />Code Better.
        </h1>
        <p style={{ color: "rgba(255,255,255,0.9)", fontSize: "18px", maxWidth: "600px", margin: "20px auto 36px" }}>
          Analyze Python and C code using AI-powered code reviews, static analysis, security scanning, and intelligent recommendations.
        </p>
        <div style={{ display: "flex", gap: "14px", justifyContent: "center" }}>
          <button onClick={() => navigate("/register")} style={{
            padding: "14px 28px", background: "#0F172A", color: "#fff",
            border: "none", borderRadius: "999px", fontWeight: 600, fontSize: "15px",
            display: "flex", alignItems: "center", gap: "8px",
          }}>
            Get Started <ArrowRight size={16} />
          </button>
          <button onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })} style={{
            padding: "14px 28px", background: "transparent", color: "#fff",
            border: "1.5px solid rgba(255,255,255,0.6)", borderRadius: "999px", fontWeight: 600, fontSize: "15px",
          }}>
            View Features
          </button>
        </div>
      </div>

      <div id="features" style={{
        display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px",
        padding: "40px 48px 80px",
      }}>
        <FeatureCard icon={Code2} title="Static Analysis" text="Pylint, Bandit, Radon for Python — Cppcheck, Flawfinder, Lizard for C." />
        <FeatureCard icon={ShieldCheck} title="Security Scanning" text="Catch vulnerabilities like SQL injection, buffer overflows, and hardcoded secrets." />
        <FeatureCard icon={Gauge} title="AI Code Review" text="Gemini-powered review for bugs, refactoring, and best practices." />
        <FeatureCard icon={FileDown} title="Downloadable Reports" text="Export your review as a PDF or Markdown report anytime." />
      </div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, text }) {
  return (
    <div className="hover-card fade-in" style={{
      background: "var(--card)", border: "1px solid var(--border)",
      borderRadius: "14px", padding: "24px",
    }}>
      <div style={{
        width: "40px", height: "40px", borderRadius: "10px",
        background: "rgba(59,130,246,0.15)", display: "flex",
        alignItems: "center", justifyContent: "center", marginBottom: "14px",
      }}>
        <Icon size={20} color="var(--primary)" />
      </div>
      <h4 style={{ margin: "0 0 8px 0" }}>{title}</h4>
      <p style={{ color: "var(--text-muted)", fontSize: "14px", margin: 0 }}>{text}</p>
    </div>
  );
}

const primaryBtn = {
  padding: "10px 20px", background: "var(--primary)", color: "#fff",
  border: "none", borderRadius: "8px", fontWeight: 600, fontSize: "14px",
};
const ghostBtn = {
  padding: "10px 20px", background: "transparent", color: "var(--text)",
  border: "1px solid var(--border)", borderRadius: "8px", fontWeight: 500, fontSize: "14px",
};

export default Landing;
