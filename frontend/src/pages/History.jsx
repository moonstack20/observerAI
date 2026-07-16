import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../services/api";
import { Search, Trash2, FileCode, X } from "lucide-react";

function scoreColor(score) {
  if (score == null) return "var(--text-muted)";
  if (score >= 8) return "var(--success)";
  if (score >= 5) return "var(--warning)";
  return "var(--error)";
}

function History() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [languageFilter, setLanguageFilter] = useState("all");
  const [selected, setSelected] = useState(null);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const params = {};
      if (search) params.search = search;
      if (languageFilter !== "all") params.language = languageFilter;

      const res = await api.get("/reviews", {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      setReviews(res.data.reviews);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(fetchReviews, 300);
    return () => clearTimeout(delay);
  }, [search, languageFilter]);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!confirm("Delete this review?")) return;
    try {
      const token = localStorage.getItem("token");
      await api.delete(`/review/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReviews(reviews.filter((r) => r.id !== id));
      if (selected?.id === id) setSelected(null);
    } catch (err) {
      console.error(err);
    }
  };

  const viewDetails = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get(`/review/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelected(res.data.review);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Layout>
      <h2 style={{ margin: 0 }}>Review History</h2>
      <p style={{ color: "var(--text-muted)" }}>Browse, search, and manage your past code reviews.</p>

      <div style={{ display: "flex", gap: "12px", marginTop: "20px", maxWidth: "700px" }}>
        <div style={{
          flex: 1, display: "flex", alignItems: "center", gap: "8px",
          background: "var(--card)", border: "1px solid var(--border)",
          borderRadius: "8px", padding: "0 12px",
        }}>
          <Search size={16} color="var(--text-muted)" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by filename..."
            style={{
              flex: 1, padding: "10px 0", background: "transparent",
              border: "none", outline: "none", color: "var(--text)", fontSize: "14px",
            }}
          />
        </div>

        <select
          value={languageFilter}
          onChange={(e) => setLanguageFilter(e.target.value)}
          style={{
            padding: "10px 14px", background: "var(--card)",
            border: "1px solid var(--border)", borderRadius: "8px",
            color: "var(--text)", fontSize: "14px",
          }}
        >
          <option value="all">All Languages</option>
          <option value="python">Python</option>
          <option value="c">C</option>
        </select>
      </div>

      <div style={{ marginTop: "20px", maxWidth: "900px" }}>
        {loading ? (
          <p style={{ color: "var(--text-muted)" }}>Loading...</p>
        ) : reviews.length === 0 ? (
          <div style={{
            padding: "40px", textAlign: "center", color: "var(--text-muted)",
            background: "var(--card)", borderRadius: "12px", border: "1px solid var(--border)",
          }}>
            <FileCode size={32} style={{ marginBottom: "8px", opacity: 0.5 }} />
            <p>No reviews found yet.</p>
          </div>
        ) : (
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  <th style={thStyle}>Filename</th>
                  <th style={thStyle}>Language</th>
                  <th style={thStyle}>Score</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Date</th>
                  <th style={thStyle}></th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => viewDetails(r.id)}
                    style={{ borderBottom: "1px solid var(--border)", cursor: "pointer" }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "var(--card-hover)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  >
                    <td style={tdStyle}>{r.filename}</td>
                    <td style={tdStyle}>
                      <span style={{
                        padding: "2px 10px", borderRadius: "999px", fontSize: "12px",
                        background: r.language === "python" ? "#3776AB" : "#5C6BC0",
                        color: "#fff",
                      }}>
                        {r.language === "python" ? "Python" : "C"}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, color: scoreColor(r.quality_score), fontWeight: 600 }}>
                      {r.quality_score ?? "—"}
                    </td>
                    <td style={tdStyle}>
                      <span style={{ color: r.status === "analyzed" ? "var(--success)" : "var(--text-muted)" }}>
                        {r.status === "analyzed" ? "✅ Analyzed" : "Pending"}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, color: "var(--text-muted)" }}>
                      {new Date(r.created_at).toLocaleDateString()}
                    </td>
                    <td style={tdStyle}>
                      <button
                        onClick={(e) => handleDelete(r.id, e)}
                        style={{
                          background: "transparent", border: "none",
                          color: "var(--error)", cursor: "pointer", padding: "4px",
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && <ReviewDetailModal review={selected} onClose={() => setSelected(null)} />}
    </Layout>
  );
}

function ReviewDetailModal({ review, onClose }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="fade-in"
        style={{
          background: "var(--card)", border: "1px solid var(--border)",
          borderRadius: "16px", padding: "28px", width: "500px",
          maxHeight: "80vh", overflowY: "auto",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <h3 style={{ margin: 0 }}>{review.filename}</h3>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ marginTop: "16px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <InfoPill label="Language" value={review.language === "python" ? "Python" : "C"} />
          <InfoPill label="Score" value={`${review.quality_score ?? "—"} / 10`} />
          <InfoPill label="Status" value={review.status} />
          <InfoPill label="Date" value={new Date(review.created_at).toLocaleString()} />
        </div>

        {review.analysis?.ai_review?.summary && (
          <div style={{ marginTop: "20px" }}>
            <h4>AI Summary</h4>
            <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>{review.analysis.ai_review.summary}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoPill({ label, value }) {
  return (
    <div style={{
      background: "var(--bg)", border: "1px solid var(--border)",
      borderRadius: "8px", padding: "8px 12px", fontSize: "13px",
    }}>
      <span style={{ color: "var(--text-muted)" }}>{label}: </span>
      <strong>{value}</strong>
    </div>
  );
}

const thStyle = {
  textAlign: "left", padding: "12px 16px", fontSize: "13px",
  color: "var(--text-muted)", fontWeight: 500,
};

const tdStyle = {
  padding: "12px 16px", fontSize: "14px",
};

export default History;
