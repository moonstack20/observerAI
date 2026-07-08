import { NavLink } from "react-router-dom";

function Sidebar() {
  const linkStyle = ({ isActive }) => ({
    display: "block",
    padding: "10px 16px",
    textDecoration: "none",
    color: isActive ? "#fff" : "#333",
    background: isActive ? "#4f46e5" : "transparent",
    borderRadius: "6px",
    marginBottom: "6px",
  });

  return (
    <div style={{
      width: "200px",
      padding: "16px",
      borderRight: "1px solid #ddd",
      minHeight: "calc(100vh - 56px)",
      background: "#fafafa"
    }}>
      <NavLink to="/dashboard" style={linkStyle}>Dashboard</NavLink>
      <NavLink to="/upload" style={linkStyle}>Upload</NavLink>
      <NavLink to="/history" style={linkStyle}>History</NavLink>
    </div>
  );
}

export default Sidebar;
