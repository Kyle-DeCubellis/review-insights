import Link from "next/link";

export default function HomePage() {
  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <div style={{ maxWidth: 560, textAlign: "center" }}>
        <div style={{ fontSize: "2.75rem", marginBottom: "0.5rem" }}>📊</div>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 700, marginBottom: "0.75rem", lineHeight: 1.2 }}>
          Review Insights
        </h1>
        <p style={{ color: "#64748b", marginBottom: "2rem", fontSize: "1.125rem", lineHeight: 1.6 }}>
          AI-powered classification for your Shopify reviews. Understand sentiment, themes, and trends — then act on them.
        </p>

        {/* Primary CTA */}
        <Link
          href="/dashboard/demo"
          style={{
            display: "inline-block",
            padding: "0.875rem 2rem",
            background: "#2563eb",
            color: "#fff",
            borderRadius: 8,
            fontWeight: 600,
            fontSize: "1.1rem",
            marginBottom: "0.75rem",
            boxShadow: "0 4px 14px rgba(37,99,235,0.3)",
          }}
        >
          Try the Live Demo
        </Link>
        <div style={{ fontSize: "0.8rem", color: "#94a3b8", marginBottom: "1.5rem" }}>
          No sign-up required — see real AI classification in action
        </div>

        {/* Secondary CTA */}
        <a
          href="/api/oauth/authorize?shop=your-store.myshopify.com"
          style={{
            display: "inline-block",
            padding: "0.625rem 1.25rem",
            background: "#fff",
            color: "#1e293b",
            borderRadius: 8,
            fontWeight: 600,
            fontSize: "0.9rem",
            border: "1px solid #e2e8f0",
          }}
        >
          Connect Your Store
        </a>

        {/* Feature cards */}
        <div style={{ marginTop: "3rem", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
          {[
            { icon: "🤖", title: "AI Classification", desc: "Claude classifies every review by theme and sentiment in real-time" },
            { icon: "📊", title: "Live Dashboard", desc: "Sentiment breakdown, top themes, and week-over-week trends" },
            { icon: "🔔", title: "Slack Digests", desc: "Daily summaries delivered to your team's Slack channel" },
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
