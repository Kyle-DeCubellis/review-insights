import Link from "next/link";

export default function HomePage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" }}>

      {/* ── Nav ──────────────────────────────────────────────────────── */}
      <nav style={{
        background: "rgba(255,255,255,0.97)",
        borderBottom: "1px solid #e2e8f0",
        padding: "0.875rem 0",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}>
        <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
            <div style={{
              width: 34, height: 34, borderRadius: 9,
              background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontWeight: 800, fontSize: "1.0625rem", flexShrink: 0,
            }}>R</div>
            <span style={{ fontWeight: 700, fontSize: "1.125rem", color: "#0f172a" }}>Review Insights</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <a
              href="#features"
              style={{ fontSize: "0.875rem", color: "#475569", fontWeight: 500, textDecoration: "none" }}
            >
              Features
            </a>
            <a
              href="#how-it-works"
              style={{ fontSize: "0.875rem", color: "#475569", fontWeight: 500, textDecoration: "none" }}
            >
              How it works
            </a>
            <Link
              href="/dashboard/demo"
              style={{
                padding: "0.5rem 1.125rem",
                background: "#2563eb",
                color: "#fff",
                borderRadius: 8,
                fontWeight: 600,
                fontSize: "0.875rem",
                textDecoration: "none",
              }}
            >
              View Demo →
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section style={{
        background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 55%, #7c3aed 100%)",
        padding: "5.5rem 0 5rem",
        color: "#fff",
        textAlign: "center",
      }}>
        <div className="container">
          {/* Badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "0.375rem",
            background: "rgba(255,255,255,0.15)",
            borderRadius: 999, padding: "0.375rem 0.875rem",
            fontSize: "0.75rem", fontWeight: 600, letterSpacing: 0.5,
            textTransform: "uppercase", marginBottom: "1.75rem",
            border: "1px solid rgba(255,255,255,0.25)",
          }}>
            ✦ Powered by Claude Sonnet 4.6
          </div>

          <h1 style={{
            fontSize: "clamp(2.25rem, 5vw, 3.5rem)",
            fontWeight: 800,
            lineHeight: 1.15,
            marginBottom: "1.375rem",
            maxWidth: 740,
            margin: "0 auto 1.375rem",
            color: "#fff",
          }}>
            Turn Customer Reviews Into<br />
            <span style={{ color: "#93c5fd" }}>Actionable Insights</span>
          </h1>

          <p style={{
            fontSize: "1.125rem",
            color: "rgba(255,255,255,0.8)",
            maxWidth: 560,
            margin: "0 auto 2.25rem",
            lineHeight: 1.7,
          }}>
            AI-powered classification for your Shopify reviews. Understand sentiment,
            themes, and trends — automatically, every single day.
          </p>

          {/* Live store analyser form */}
          <form
            action="/dashboard/demo"
            method="get"
            style={{ maxWidth: 520, margin: "0 auto 1.5rem" }}
          >
            <div style={{
              display: "flex", gap: "0.5rem",
              background: "rgba(255,255,255,0.12)",
              borderRadius: 12, padding: "0.375rem",
              border: "1px solid rgba(255,255,255,0.25)",
            }}>
              <input
                type="text"
                name="shop"
                placeholder="mystore.myshopify.com"
                style={{
                  flex: 1,
                  padding: "0.75rem 1rem",
                  borderRadius: 8,
                  border: "none",
                  background: "rgba(255,255,255,0.95)",
                  color: "#1e293b",
                  fontSize: "1rem",
                  outline: "none",
                  minWidth: 0,
                }}
              />
              <button
                type="submit"
                style={{
                  padding: "0.75rem 1.375rem",
                  background: "#fff",
                  color: "#1e3a8a",
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: "0.9375rem",
                  border: "none",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                Analyse Free →
              </button>
            </div>
            <p style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.55)", marginTop: "0.625rem" }}>
              Paste any Shopify URL — we&apos;ll fetch real reviews &amp; classify them with Claude AI in real-time.
            </p>
          </form>

          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <a
              href="/api/oauth/authorize?shop=your-store.myshopify.com"
              style={{
                padding: "0.75rem 1.75rem",
                background: "rgba(255,255,255,0.15)",
                color: "#fff",
                borderRadius: 10,
                fontWeight: 600,
                fontSize: "0.9375rem",
                textDecoration: "none",
                border: "1px solid rgba(255,255,255,0.35)",
              }}
            >
              Connect your store (OAuth)
            </a>
            <Link
              href="/dashboard/demo"
              style={{
                padding: "0.75rem 1.75rem",
                background: "rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.75)",
                borderRadius: 10,
                fontWeight: 500,
                fontSize: "0.9375rem",
                border: "1px solid rgba(255,255,255,0.2)",
                textDecoration: "none",
              }}
            >
              Open demo page
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats bar ────────────────────────────────────────────────── */}
      <section style={{
        background: "#fff",
        borderBottom: "1px solid #e2e8f0",
        padding: "1.375rem 0",
      }}>
        <div className="container" style={{
          display: "flex",
          justifyContent: "center",
          gap: "3rem",
          flexWrap: "wrap",
        }}>
          {[
            { value: "24", label: "Tracked themes" },
            { value: "Claude Sonnet", label: "AI model" },
            { value: "Daily cron", label: "Auto-pipeline" },
            { value: "Real-time", label: "Dashboard" },
          ].map((s) => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div style={{ fontWeight: 700, color: "#2563eb", fontSize: "1.0625rem" }}>{s.value}</div>
              <div style={{ color: "#64748b", fontSize: "0.8125rem" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────── */}
      <section id="features" style={{ padding: "5rem 0", background: "#f8fafc" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 800, marginBottom: "0.75rem", color: "#0f172a" }}>
              Everything you need to understand your customers
            </h2>
            <p style={{ color: "#64748b", fontSize: "1.0625rem", maxWidth: 520, margin: "0 auto", lineHeight: 1.7 }}>
              From raw review text to structured intelligence — Review Insights handles the full pipeline.
            </p>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "1.25rem",
          }}>
            {[
              {
                icon: "🤖",
                title: "AI Classification",
                desc: "Claude Sonnet reads each review and classifies it by theme and sentiment — with a confidence score.",
                detail: "24 themes · Sentiment scoring · Confidence metrics",
              },
              {
                icon: "📊",
                title: "Live Dashboard",
                desc: "Real-time sentiment breakdown, top themes, and week-over-week comparisons in one clean view.",
                detail: "Pie charts · Theme bars · WoW trends",
              },
              {
                icon: "🔔",
                title: "Slack Digests",
                desc: "A daily summary posted to your Slack channel every morning with top themes and sentiment shifts.",
                detail: "8 AM UTC · Thread replies · Per-store",
              },
              {
                icon: "🔗",
                title: "Judge.me OAuth",
                desc: "Connects directly to Judge.me via OAuth 2.0 — no manual CSV exports or copy-pasting needed.",
                detail: "OAuth 2.0 · Auto-fetch · Incremental sync",
              },
              {
                icon: "🗄️",
                title: "Full Review History",
                desc: "Every review is stored and indexed in Supabase for historical trend analysis over any period.",
                detail: "Supabase · Drizzle ORM · Indexed queries",
              },
              {
                icon: "⚡",
                title: "Automated Pipeline",
                desc: "Fetch, classify, and digest steps run automatically each morning as Vercel cron jobs.",
                detail: "6 AM fetch · 7 AM classify · 8 AM digest",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="card"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.625rem",
                }}
              >
                <div style={{ fontSize: "2rem", lineHeight: 1 }}>{f.icon}</div>
                <div style={{ fontWeight: 700, fontSize: "1.0625rem", color: "#0f172a" }}>{f.title}</div>
                <div style={{ fontSize: "0.875rem", color: "#64748b", lineHeight: 1.65, flex: 1 }}>{f.desc}</div>
                <div style={{
                  fontSize: "0.75rem", color: "#2563eb", fontWeight: 500,
                  padding: "0.375rem 0.625rem", background: "#eff6ff",
                  borderRadius: 6, alignSelf: "flex-start",
                }}>
                  {f.detail}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────── */}
      <section id="how-it-works" style={{ padding: "5rem 0", background: "#fff" }}>
        <div className="container">
          <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 800, textAlign: "center", marginBottom: "3rem", color: "#0f172a" }}>
            How it works
          </h2>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "2rem",
            maxWidth: 860,
            margin: "0 auto",
          }}>
            {[
              {
                step: "1",
                title: "Connect your store",
                desc: "OAuth into Judge.me and select your product category. The whole setup takes under two minutes.",
              },
              {
                step: "2",
                title: "AI classifies reviews",
                desc: "Each morning, Claude reads every new review and classifies it by theme and sentiment automatically.",
              },
              {
                step: "3",
                title: "Get daily insights",
                desc: "Check your live dashboard any time, or receive a Slack digest with the latest trends.",
              },
            ].map((s) => (
              <div key={s.step} style={{ textAlign: "center", padding: "0.5rem 1rem" }}>
                <div style={{
                  width: 52, height: 52, borderRadius: "50%",
                  background: "linear-gradient(135deg, #2563eb, #7c3aed)",
                  color: "#fff", fontWeight: 800, fontSize: "1.375rem",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 1.125rem",
                  boxShadow: "0 4px 14px rgba(37,99,235,0.3)",
                }}>
                  {s.step}
                </div>
                <div style={{ fontWeight: 700, fontSize: "1.0625rem", marginBottom: "0.5rem", color: "#0f172a" }}>{s.title}</div>
                <div style={{ fontSize: "0.875rem", color: "#64748b", lineHeight: 1.65 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ───────────────────────────────────────────────── */}
      <section style={{
        background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)",
        padding: "4.5rem 0",
        color: "#fff",
        textAlign: "center",
      }}>
        <div className="container">
          <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)", fontWeight: 800, marginBottom: "1rem" }}>
            Ready to understand your customers?
          </h2>
          <p style={{ color: "rgba(255,255,255,0.8)", marginBottom: "2.25rem", fontSize: "1.0625rem", lineHeight: 1.6 }}>
            Connect your Judge.me store and get your first insights within minutes.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <a
              href="/api/oauth/authorize?shop=your-store.myshopify.com"
              style={{
                padding: "0.9rem 2.25rem",
                background: "#fff",
                color: "#1e3a8a",
                borderRadius: 10,
                fontWeight: 700,
                fontSize: "1rem",
                textDecoration: "none",
                boxShadow: "0 4px 14px rgba(0,0,0,0.18)",
              }}
            >
              Get Started →
            </a>
            <Link
              href="/dashboard/demo"
              style={{
                padding: "0.9rem 2.25rem",
                background: "rgba(255,255,255,0.15)",
                color: "#fff",
                borderRadius: 10,
                fontWeight: 600,
                fontSize: "1rem",
                border: "1px solid rgba(255,255,255,0.35)",
                textDecoration: "none",
              }}
            >
              View Demo First
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer style={{
        background: "#0f172a",
        color: "#64748b",
        padding: "1.625rem 0",
        textAlign: "center",
        fontSize: "0.875rem",
      }}>
        <div className="container">
          <span>© 2025 Review Insights · Built with Claude AI &amp; Judge.me</span>
        </div>
      </footer>

    </div>
  );
}
