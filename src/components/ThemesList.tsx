"use client";

interface Theme {
  theme: string;
  count: number;
  avgSentiment: number;
}

interface ThemesListProps {
  themes: Theme[];
  limit?: number;
}

function sentimentColor(avg: number): string {
  if (avg > 0.2) return "#22c55e";
  if (avg < -0.2) return "#ef4444";
  return "#94a3b8";
}

function formatThemeName(theme: string): string {
  return theme
    .replace(/^[CP]_/, "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function SentimentBar({ value }: { value: number }) {
  // value is -1 to 1; map to 0-100% position on a bar
  const pct = Math.round(((value + 1) / 2) * 100);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{ flex: 1, height: 6, background: "#f1f5f9", borderRadius: 3, position: "relative" }}>
        <div
          style={{
            position: "absolute",
            left: `${pct}%`,
            top: "50%",
            transform: "translate(-50%, -50%)",
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: sentimentColor(value),
            border: "2px solid #fff",
            boxShadow: "0 0 0 1px #e2e8f0",
          }}
        />
      </div>
      <span style={{ fontSize: 11, color: sentimentColor(value), minWidth: 32, textAlign: "right", fontWeight: 600 }}>
        {value > 0 ? "+" : ""}{value.toFixed(2)}
      </span>
    </div>
  );
}

export default function ThemesList({ themes, limit = 5 }: ThemesListProps) {
  const displayed = themes.slice(0, limit);

  if (displayed.length === 0) {
    return (
      <div style={{ color: "#94a3b8", fontSize: "0.875rem", padding: "1rem 0" }}>
        No theme data yet
      </div>
    );
  }

  const maxCount = Math.max(...displayed.map((t) => t.count));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
      {displayed.map((t, i) => (
        <div key={t.theme}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontWeight: 500, fontSize: "0.875rem" }}>
              <span style={{ color: "#94a3b8", marginRight: 6, fontSize: "0.75rem" }}>#{i + 1}</span>
              {formatThemeName(t.theme)}
              <span style={{ fontSize: "0.75rem", color: "#64748b", marginLeft: 4 }}>({t.theme})</span>
            </span>
            <span style={{ fontWeight: 700, fontSize: "0.875rem" }}>{t.count}</span>
          </div>

          {/* Mention bar */}
          <div style={{ height: 6, background: "#f1f5f9", borderRadius: 3, marginBottom: 4 }}>
            <div
              style={{
                height: "100%",
                width: `${(t.count / maxCount) * 100}%`,
                background: "#2563eb",
                borderRadius: 3,
                transition: "width 0.3s",
              }}
            />
          </div>

          <SentimentBar value={t.avgSentiment} />
        </div>
      ))}
    </div>
  );
}
