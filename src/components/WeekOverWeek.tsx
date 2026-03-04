"use client";

interface WeekData {
  currentWeek: { positive: number; negative: number; neutral: number; total: number };
  previousWeek: { positive: number; negative: number; neutral: number; total: number };
  positiveChange: number | null;
  negativeChange: number | null;
}

interface WeekOverWeekProps {
  data: WeekData;
}

function ChangeIndicator({ pct }: { pct: number | null }) {
  if (pct === null) return <span style={{ color: "#94a3b8", fontSize: "0.75rem" }}>N/A</span>;
  const color = pct > 0 ? "#22c55e" : pct < 0 ? "#ef4444" : "#94a3b8";
  return (
    <span style={{ color, fontWeight: 600, fontSize: "0.875rem" }}>
      {pct > 0 ? "+" : ""}{pct}%
    </span>
  );
}

export default function WeekOverWeek({ data }: WeekOverWeekProps) {
  const { currentWeek, previousWeek, positiveChange, negativeChange } = data;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
      <div style={{ padding: "1rem", background: "#f0fdf4", borderRadius: 8, border: "1px solid #bbf7d0" }}>
        <div style={{ fontSize: "0.75rem", color: "#16a34a", fontWeight: 600, marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: 0.5 }}>
          Positive Reviews
        </div>
        <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "#15803d" }}>
          {currentWeek.positive}
        </div>
        <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.25rem" }}>
          vs {previousWeek.positive} last week &nbsp; <ChangeIndicator pct={positiveChange} />
        </div>
      </div>

      <div style={{ padding: "1rem", background: "#fef2f2", borderRadius: 8, border: "1px solid #fecaca" }}>
        <div style={{ fontSize: "0.75rem", color: "#dc2626", fontWeight: 600, marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: 0.5 }}>
          Negative Reviews
        </div>
        <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "#b91c1c" }}>
          {currentWeek.negative}
        </div>
        <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.25rem" }}>
          vs {previousWeek.negative} last week &nbsp; <ChangeIndicator pct={negativeChange} />
        </div>
      </div>

      <div style={{ gridColumn: "1 / -1", padding: "0.75rem 1rem", background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
          <span style={{ color: "#64748b" }}>This week total</span>
          <span style={{ fontWeight: 700 }}>{currentWeek.total} reviews</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem", marginTop: "0.25rem" }}>
          <span style={{ color: "#64748b" }}>Previous week total</span>
          <span style={{ fontWeight: 700 }}>{previousWeek.total} reviews</span>
        </div>
      </div>
    </div>
  );
}
