import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../services/api";
import { FolderGit2, FileCode2, TrendingUp } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from "recharts";

const COLORS = ["#3B82F6", "#EF4444", "#F59E0B", "#22C55E"];

function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [summary, setSummary] = useState({
    total_projects: 0, total_reviews: 0, avg_quality_score: null,
    issue_distribution: {}, recent_scores: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get("/dashboard/summary", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSummary(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  const cards = [
    { label: "Total Projects", value: summary.total_projects, icon: FolderGit2, color: "var(--primary)" },
    { label: "Total Reviews", value: summary.total_reviews, icon: FileCode2, color: "var(--success)" },
    { label: "Avg Quality Score", value: summary.avg_quality_score ?? "—", icon: TrendingUp, color: "var(--warning)" },
  ];

  const pieData = summary.issue_distribution
    ? Object.entries(summary.issue_distribution)
        .filter(([, v]) => v > 0)
        .map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }))
    : [];

  return (
    <Layout>
      <h2 style={{ margin: 0 }}>Welcome back, {user?.name} 👋</h2>
      <p style={{ color: "var(--text-muted)" }}>Here's an overview of your code reviews.</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginTop: "24px" }}>
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="fade-in" style={{
              background: "var(--card)", border: "1px solid var(--border)",
              borderRadius: "12px", padding: "20px", animationDelay: `${i * 0.05}s`,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "var(--text-muted)", fontSize: "13px" }}>{card.label}</span>
                <Icon size={18} color={card.color} />
              </div>
              <p style={{ fontSize: "28px", fontWeight: 700, margin: "8px 0 0 0" }}>
                {loading ? "..." : card.value}
              </p>
            </div>
          );
        })}
      </div>

      {!loading && summary.total_reviews > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "24px" }}>
          <div className="fade-in" style={{
            background: "var(--card)", border: "1px solid var(--border)",
            borderRadius: "12px", padding: "20px",
          }}>
            <h4 style={{ marginTop: 0 }}>Issue Distribution</h4>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)" }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p style={{ color: "var(--text-muted)" }}>No issues found yet.</p>
            )}
          </div>

          <div className="fade-in" style={{
            background: "var(--card)", border: "1px solid var(--border)",
            borderRadius: "12px", padding: "20px",
          }}>
            <h4 style={{ marginTop: 0 }}>Recent Quality Scores</h4>
            {summary.recent_scores.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={summary.recent_scores}>
                  <XAxis dataKey="label" stroke="var(--text-muted)" fontSize={11} />
                  <YAxis domain={[0, 10]} stroke="var(--text-muted)" fontSize={11} />
                  <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)" }} />
                  <Bar dataKey="score" fill="var(--primary)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p style={{ color: "var(--text-muted)" }}>No scored reviews yet.</p>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
}

export default Dashboard;