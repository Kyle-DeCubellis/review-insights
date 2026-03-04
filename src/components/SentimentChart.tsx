"use client";

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface SentimentChartProps {
  positive: number;
  negative: number;
  neutral: number;
}

const COLORS = {
  Positive: "#22c55e",
  Negative: "#ef4444",
  Neutral: "#94a3b8",
};

export default function SentimentChart({ positive, negative, neutral }: SentimentChartProps) {
  const total = positive + negative + neutral;

  const data = [
    { name: "Positive", value: positive },
    { name: "Negative", value: negative },
    { name: "Neutral", value: neutral },
  ].filter((d) => d.value > 0);

  if (total === 0) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 220, color: "#94a3b8", fontSize: "0.875rem" }}>
        No reviews in this period
      </div>
    );
  }

  return (
    <div>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry) => (
              <Cell
                key={entry.name}
                fill={COLORS[entry.name as keyof typeof COLORS]}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => [
              `${value} (${Math.round((value / total) * 100)}%)`,
            ]}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>

      <div style={{ display: "flex", justifyContent: "space-around", marginTop: "0.5rem" }}>
        {[
          { label: "Positive", value: positive, color: "#22c55e" },
          { label: "Negative", value: negative, color: "#ef4444" },
          { label: "Neutral", value: neutral, color: "#94a3b8" },
        ].map((s) => (
          <div key={s.label} style={{ textAlign: "center" }}>
            <div style={{ fontSize: "1.5rem", fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
