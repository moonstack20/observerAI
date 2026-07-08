import { useNavigate } from "react-router-dom";

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
      padding: "12px 24px",
      borderBottom: "1px solid #ddd",
      background: "#fff"
    }}>
      <h3 style={{ margin: 0 }}>🚀 observerAI</h3>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <span>{user?.name}</span>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
}

export default Navbar;
