import Link from "next/link";

export default function HomePage() {
  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <div style={{ maxWidth: 480, textAlign: "center" }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 700, marginBottom: "1rem" }}>
          Review Insights
        </h1>
        <p style={{ color: "#64748b", marginBottom: "2rem", fontSize: "1.125rem" }}>
          AI-powered classification for your Shopify reviews. Understand sentiment, themes, and trends at a glance.
        </p>

        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <a
            href="/api/oauth/authorize?shop=your-store.myshopify.com"
            style={{
              display: "inline-block",
              padding: "0.75rem 1.5rem",
              background: "#2563eb",
              color: "#fff",
              borderRadius: 8,
              fontWeight: 600,
              fontSize: "1rem",
            }}
          >
            Connect Judge.me
          </a>
          <Link
            href="/dashboard/demo"
            style={{
              display: "inline-block",
              padding: "0.75rem 1.5rem",
              background: "#f1f5f9",
              color: "#1e293b",
              borderRadius: 8,
              fontWeight: 600,
              fontSize: "1rem",
              border: "1px solid #e2e8f0",
            }}
          >
            View Demo Dashboard
          </Link>
        </div>

        <div style={{ marginTop: "3rem", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
          {[
            { icon: "🤖", title: "AI Classification", desc: "Claude classifies every review by theme and sentiment" },
            { icon: "📊", title: "Live Dashboard", desc: "Real-time sentiment breakdown and top themes" },
            { icon: "🔔", title: "Slack Digests", desc: "Daily summaries delivered to your Slack channel" },
          ].map((f) => (
            <div key={f.title} style={{ padding: "1.25rem", background: "#fff", borderRadius: 10, border: "1px solid #e2e8f0", textAlign: "left" }}>
              <div style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>{f.icon}</div>
              <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>{f.title}</div>
              <div style={{ fontSize: "0.875rem", color: "#64748b" }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
