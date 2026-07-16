import { NavLink } from "react-router-dom";
import { LayoutDashboard, Upload, History } from "lucide-react";

function Sidebar() {
  const linkStyle = ({ isActive }) => ({
    display: "flex", alignItems: "center", gap: "10px",
    padding: "10px 16px",
    color: isActive ? "#fff" : "var(--text-muted)",
    background: isActive ? "var(--primary)" : "transparent",
    borderRadius: "8px",
    marginBottom: "6px",
    fontSize: "14px",
    fontWeight: 500,
  });

  return (
    <div style={{
      width: "220px",
      padding: "20px 12px",
      borderRight: "1px solid var(--border)",
      minHeight: "calc(100vh - 61px)",
      background: "var(--bg)",
    }}>
      <NavLink to="/dashboard" style={linkStyle}>
        <LayoutDashboard size={18} /> Dashboard
      </NavLink>
      <NavLink to="/upload" style={linkStyle}>
        <Upload size={18} /> Upload
      </NavLink>
      <NavLink to="/history" style={linkStyle}>
        <History size={18} /> History
      </NavLink>
    </div>
  );
}

export default Sidebar;
