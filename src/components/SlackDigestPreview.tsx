"use client";

interface SlackDigestPreviewProps {
  storeName: string;
  sentiment: { positive: number; negative: number; neutral: number };
  topThemes: { theme: string; count: number; avgSentiment: number }[];
}

function formatThemeName(theme: string): string {
  return theme
    .replace(/^[CP]_/, "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function themeEmoji(avgSentiment: number): string {
  if (avgSentiment > 0.3) return "\u2705";
  if (avgSentiment < -0.3) return "\u26a0\ufe0f";
  return "\u2796";
}

export default function SlackDigestPreview({ storeName, sentiment, topThemes }: SlackDigestPreviewProps) {
  const total = sentiment.positive + sentiment.negative + sentiment.neutral;
  const positivePct = total > 0 ? Math.round((sentiment.positive / total) * 100) : 0;
  const negativePct = total > 0 ? Math.round((sentiment.negative / total) * 100) : 0;
  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  return (
    <div style={{ borderRadius: 8, overflow: "hidden", border: "1px solid #1a1d21", display: "flex", height: 380, fontSize: 13, fontFamily: "Lato, -apple-system, sans-serif" }}>
      {/* Sidebar */}
      <div style={{ width: 200, background: "#1a1d21", padding: "12px 0", flexShrink: 0, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "0 12px 12px", fontWeight: 700, color: "#fff", fontSize: 15 }}>
          {storeName}
        </div>
        <div style={{ borderTop: "1px solid #333", padding: "8px 0" }}>
          {[
            { name: "general", active: false },
            { name: "product-updates", active: false },
            { name: "insight-me-digests", active: true },
            { name: "support-alerts", active: false },
          ].map((ch) => (
            <div
              key={ch.name}
              style={{
                padding: "3px 12px",
                color: ch.active ? "#fff" : "#9b9d9f",
                background: ch.active ? "#1164a3" : "transparent",
                borderRadius: ch.active ? 4 : 0,
                margin: ch.active ? "0 8px" : 0,
                fontSize: 13,
                cursor: "default",
              }}
            >
              <span style={{ color: ch.active ? "#fff" : "#6b6d70", marginRight: 4 }}>#</span>
              {ch.name}
            </div>
          ))}
        </div>
      </div>

      {/* Message area */}
      <div style={{ flex: 1, background: "#fff", display: "flex", flexDirection: "column" }}>
        {/* Channel header */}
        <div style={{ padding: "8px 16px", borderBottom: "1px solid #e2e2e2", fontWeight: 700, fontSize: 14 }}>
          <span style={{ color: "#6b6d70", marginRight: 4 }}>#</span>
          insight-me-digests
        </div>

        {/* Message */}
        <div style={{ flex: 1, padding: "16px", overflowY: "auto" }}>
          <div style={{ display: "flex", gap: 8 }}>
            {/* Bot avatar */}
            <div style={{
              width: 36, height: 36, borderRadius: 4, background: "linear-gradient(135deg, #2563eb, #7c3aed)",
              display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 16, fontWeight: 700, flexShrink: 0,
            }}>
              IM
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ marginBottom: 4 }}>
                <span style={{ fontWeight: 700, fontSize: 14 }}>Insight.me</span>
                <span style={{ fontSize: 11, color: "#616061", marginLeft: 6, background: "#f0f0f0", padding: "1px 4px", borderRadius: 3, fontWeight: 500 }}>APP</span>
                <span style={{ fontSize: 11, color: "#616061", marginLeft: 8 }}>{timeStr}</span>
              </div>

              {/* Block Kit style message */}
              <div style={{ borderLeft: "4px solid #2563eb", paddingLeft: 12 }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8 }}>
                  Daily Review Digest — {storeName}
                </div>
                <div style={{ color: "#1d1c1d", marginBottom: 6 }}>
                  <strong>{total} reviews</strong> analyzed today
                </div>
                <div style={{ marginBottom: 8 }}>
                  <span style={{ color: "#22c55e" }}>{positivePct}% positive</span>
                  {" \u00b7 "}
                  <span style={{ color: "#ef4444" }}>{negativePct}% negative</span>
                  {" \u00b7 "}
                  <span style={{ color: "#94a3b8" }}>{100 - positivePct - negativePct}% neutral</span>
                </div>

                {topThemes.length > 0 && (
                  <>
                    <div style={{ fontWeight: 600, fontSize: 12, color: "#616061", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>
                      Top Themes
                    </div>
                    {topThemes.slice(0, 4).map((t) => (
                      <div key={t.theme} style={{ fontSize: 13, marginBottom: 2 }}>
                        {themeEmoji(t.avgSentiment)} {formatThemeName(t.theme)} — {t.count} mentions
                      </div>
                    ))}
                  </>
                )}

                <div style={{ marginTop: 8, fontSize: 12, color: "#1264a3", cursor: "default" }}>
                  View full dashboard →
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
