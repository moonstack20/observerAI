import Layout from "../components/Layout";

function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <Layout>
      <h2>Welcome back, {user?.name} 👋</h2>
      <p>Here's an overview of your code reviews.</p>

      <div style={{ display: "flex", gap: "16px", marginTop: "24px" }}>
        <div style={cardStyle}>
          <h4>Total Projects</h4>
          <p style={{ fontSize: "24px", margin: 0 }}>0</p>
        </div>
        <div style={cardStyle}>
          <h4>Total Reviews</h4>
          <p style={{ fontSize: "24px", margin: 0 }}>0</p>
        </div>
        <div style={cardStyle}>
          <h4>Avg Quality Score</h4>
          <p style={{ fontSize: "24px", margin: 0 }}>--</p>
        </div>
      </div>
    </Layout>
  );
}

const cardStyle = {
  flex: 1,
  padding: "16px",
  border: "1px solid #ddd",
  borderRadius: "8px",
  background: "#fff",
};

export default Dashboard;
