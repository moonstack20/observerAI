function Dashboard() {
    const user = JSON.parse(localStorage.getItem("user"));
  
    return (
      <div style={{ padding: 40 }}>
        <h2>Welcome, {user?.name} 👋</h2>
        <p>Dashboard coming soon (Day 3 work).</p>
      </div>
    );
  }
  
  export default Dashboard;
  