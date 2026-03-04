import { Suspense } from "react";
import type { DashboardResponse } from "@/app/api/dashboard/[storeId]/route";
import SentimentChart from "@/components/SentimentChart";
import ThemesList from "@/components/ThemesList";
import ReviewsList from "@/components/ReviewsList";
import WeekOverWeek from "@/components/WeekOverWeek";

async function getDashboardData(storeId: string): Promise<DashboardResponse | null> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  try {
    const res = await fetch(`${appUrl}/api/dashboard/${storeId}`, {
      next: { revalidate: 60 }, // revalidate every minute
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

interface PageProps {
  params: { storeId: string };
}

export default async function DashboardPage({ params }: PageProps) {
  const data = await getDashboardData(params.storeId);

  if (!data) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>Store not found</h2>
          <p style={{ color: "#64748b" }}>Check the store ID and try again.</p>
        </div>
      </div>
    );
  }

  const fromDate = new Date(data.period.from).toLocaleDateString("en-US", {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
  const toDate = new Date(data.period.to).toLocaleDateString("en-US", {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      {/* Header */}
      <header style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "1rem 0" }}>
        <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ fontSize: "1.25rem", fontWeight: 700 }}>Review Insights</h1>
            <p style={{ fontSize: "0.875rem", color: "#64748b" }}>{data.shopifyStoreId}</p>
          </div>
          <div style={{ textAlign: "right", fontSize: "0.75rem", color: "#94a3b8" }}>
            <div>Last updated: {toDate}</div>
            <div>Period: {fromDate} — {toDate}</div>
          </div>
        </div>
      </header>

      <main className="container" style={{ padding: "2rem 1.5rem" }}>
        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
          {[
            { label: "Total Reviews (24h)", value: data.sentiment.total, color: "#2563eb" },
            { label: "Positive Sentiment", value: `${data.sentiment.total > 0 ? Math.round((data.sentiment.positive / data.sentiment.total) * 100) : 0}%`, color: "#22c55e" },
            { label: "Negative Sentiment", value: `${data.sentiment.total > 0 ? Math.round((data.sentiment.negative / data.sentiment.total) * 100) : 0}%`, color: "#ef4444" },
          ].map((s) => (
            <div key={s.label} className="card" style={{ textAlign: "center" }}>
              <div style={{ fontSize: "2rem", fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: "0.875rem", color: "#64748b", marginTop: "0.25rem" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Main grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
          {/* Sentiment chart */}
          <div className="card">
            <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1.25rem" }}>
              Sentiment Breakdown (Last 24 Hours)
            </h2>
            <Suspense fallback={<div style={{ height: 220, display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8" }}>Loading...</div>}>
              <SentimentChart
                positive={data.sentiment.positive}
                negative={data.sentiment.negative}
                neutral={data.sentiment.neutral}
              />
            </Suspense>
          </div>

          {/* Top themes */}
          <div className="card">
            <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1.25rem" }}>
              Top Themes (Last 24 Hours)
            </h2>
            <ThemesList themes={data.topThemes} limit={5} />
          </div>
        </div>

        {/* Week over week */}
        {data.weekOverWeek && (
          <div className="card" style={{ marginBottom: "1.5rem" }}>
            <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1.25rem" }}>
              Week-over-Week Trend
            </h2>
            <WeekOverWeek data={data.weekOverWeek} />
          </div>
        )}

        {/* Recent reviews */}
        <div className="card">
          <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1.25rem" }}>
            Recent Reviews (Last 24 Hours)
            <span style={{ fontWeight: 400, color: "#64748b", marginLeft: 8, fontSize: "0.875rem" }}>
              {data.recentReviews.length} shown
            </span>
          </h2>
          <Suspense fallback={<div style={{ color: "#94a3b8" }}>Loading reviews...</div>}>
            <ReviewsList reviews={data.recentReviews} />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
