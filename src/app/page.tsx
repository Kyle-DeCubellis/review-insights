import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <div style={{ maxWidth: 560, textAlign: "center" }}>
        <div style={{ marginBottom: "1.5rem" }}>
          <Image
            src="/logo_wordmark.png"
            alt="Insight.me"
            width={420}
            height={120}
            priority
            style={{ width: "100%", maxWidth: 420, height: "auto" }}
          />
        </div>
        <p style={{ color: "#64748b", marginBottom: "2rem", fontSize: "1.125rem", lineHeight: 1.6 }}>
          Your reviews already tell you what to fix and what to put in your next ad.
          Insight.me reads every one and surfaces the signal.
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
            { icon: "⚠️", title: "Fix These", desc: "Negative reviews grouped by theme with a specific action for each problem" },
            { icon: "🟢", title: "Amplify in Ads", desc: "Positive themes your customers praise — ready to use in campaigns" },
            { icon: "🔔", title: "Slack Digest", desc: "Daily summary delivered to your team every morning, automatically" },
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
