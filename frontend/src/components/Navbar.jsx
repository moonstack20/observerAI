import { useNavigate } from "react-router-dom";
import { LogOut, Sparkles } from "lucide-react";

function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "14px 24px",
      borderBottom: "1px solid var(--border)",
      background: "var(--card)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <Sparkles size={20} color="var(--primary)" />
        <h3 style={{ margin: 0, fontWeight: 600 }}>observerAI</h3>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <span style={{ color: "var(--text-muted)", fontSize: "14px" }}>{user?.name}</span>
        <button
          onClick={handleLogout}
          style={{
            display: "flex", alignItems: "center", gap: "6px",
            background: "transparent", border: "1px solid var(--border)",
            color: "var(--text)", padding: "8px 14px", borderRadius: "8px",
            fontSize: "14px",
          }}
        >
          <LogOut size={14} /> Logout
        </button>
      </div>
    </div>
  );
}

export default Navbar;
