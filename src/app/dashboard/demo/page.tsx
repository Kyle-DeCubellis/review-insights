"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import SentimentChart from "@/components/SentimentChart";
import ThemesList from "@/components/ThemesList";
import WeekOverWeek from "@/components/WeekOverWeek";
import ReviewsList from "@/components/ReviewsList";
import SlackDigestPreview from "@/components/SlackDigestPreview";
import { DEMO_BRANDS } from "@/data/demo-brands";

interface Insight {
  type: "warning" | "success" | "info";
  title: string;
  detail: string;
}

interface DashboardData {
  storeName: string;
  productName: string;
  brandEmoji: string;
  sentiment: { positive: number; negative: number; neutral: number; total: number };
  topThemes: { theme: string; count: number; avgSentiment: number }[];
  weekOverWeek: {
    currentWeek: { positive: number; negative: number; neutral: number; total: number };
    previousWeek: { positive: number; negative: number; neutral: number; total: number };
    positiveChange: number | null;
    negativeChange: number | null;
  };
  reviews: { id: number; text: string; rating: number; theme: string | null; sentiment: number | null; confidence: number | null; createdAt: string }[];
  insights: Insight[];
}

type Step = "idle" | "checking" | "found" | "classifying" | "done" | "error";

// ─── Theme helpers ────────────────────────────────────────────────────────────

function formatTheme(theme: string): string {
  return theme.replace(/^[CP]_/, "").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

const NEGATIVE_ACTIONS: Record<string, string> = {
  C_quality: "Add QC checkpoints before each production run",
  C_durability: "Escalate to product engineering — stress-test materials",
  C_shipping: "Review fulfillment partner SLAs and damage rates",
  C_customer_service: "Audit support response times and resolution scripts",
  C_fit_comfort: "Update product pages with detailed fit and feel notes",
  P_sizing: "Update size guide with real customer measurements",
  C_design: "Revisit form factor — customers are flagging it consistently",
  C_performance: "Run independent benchmarks against spec claims",
  C_value: "Review price-to-quality perception vs. direct competitors",
  C_packaging: "Audit packaging QC — review damage-in-transit rate",
};

const POSITIVE_MARKETING: Record<string, string> = {
  C_quality: "Lead with craftsmanship — use in hero copy and unboxing content",
  C_design: "Feature in visual ads and UGC campaigns — it's your hook",
  C_performance: "Use in comparison ads and product detail pages",
  C_value: "Activate in price-sensitive ad audiences",
  C_durability: "Perfect for long-form testimonial and review content",
  C_fit_comfort: "Add comfort callouts to PDPs and sizing guides",
  C_shipping: "Promote fast delivery as a key differentiator in ads",
  C_packaging: "Feature unboxing moments in social ads",
  C_customer_service: "Turn support wins into social proof content",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function Spinner() {
  return (
    <span style={{
      display: "inline-block", width: 16, height: 16,
      border: "2px solid #e2e8f0", borderTopColor: "#2563eb",
      borderRadius: "50%", animation: "spin 0.6s linear infinite",
    }} />
  );
}

function StepIndicator({ step, current, label, detail }: { step: Step; current: Step; label: string; detail?: string }) {
  const stepOrder: Step[] = ["checking", "found", "classifying", "done"];
  const currentIdx = stepOrder.indexOf(current);
  const stepIdx = stepOrder.indexOf(step);
  const isActive = step === current && current !== "done";
  const isDone = currentIdx > stepIdx || current === "done";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0" }}>
      <div style={{
        width: 24, height: 24, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
        background: isDone ? "#22c55e" : isActive ? "#2563eb" : "#e2e8f0",
        color: isDone || isActive ? "#fff" : "#94a3b8", fontSize: 12, fontWeight: 700,
      }}>
        {isDone ? "\u2713" : isActive ? <Spinner /> : "\u00b7"}
      </div>
      <div>
        <div style={{ fontSize: 14, fontWeight: isActive ? 600 : 400, color: isDone ? "#16a34a" : isActive ? "#1e293b" : "#94a3b8" }}>
          {label}
        </div>
        {detail && isActive && <div style={{ fontSize: 12, color: "#64748b" }}>{detail}</div>}
      </div>
    </div>
  );
}

function InsightCard({ insight }: { insight: Insight }) {
  const styles: Record<string, { bg: string; border: string; icon: string; titleColor: string }> = {
    warning: { bg: "#fffbeb", border: "#fde68a", icon: "\u26a0\ufe0f", titleColor: "#92400e" },
    success: { bg: "#f0fdf4", border: "#bbf7d0", icon: "\u2705", titleColor: "#166534" },
    info: { bg: "#eff6ff", border: "#bfdbfe", icon: "\u2139\ufe0f", titleColor: "#1e40af" },
  };
  const s = styles[insight.type] || styles.info;
  return (
    <div style={{ padding: "12px 16px", background: s.bg, border: `1px solid ${s.border}`, borderRadius: 8 }}>
      <div style={{ fontWeight: 600, fontSize: 14, color: s.titleColor, marginBottom: 4 }}>{s.icon} {insight.title}</div>
      <div style={{ fontSize: 13, color: "#475569" }}>{insight.detail}</div>
    </div>
  );
}

function ActionHub({ data }: { data: DashboardData }) {
  const negativeThemes = data.topThemes
    .filter((t) => t.avgSentiment < -0.1)
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);

  const positiveThemes = data.topThemes
    .filter((t) => t.avgSentiment > 0.2)
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);

  // Pull best sample quotes per theme
  const byTheme = (theme: string, sentiment: number) =>
    data.reviews
      .filter((r) => r.theme === theme && r.sentiment === sentiment && (r.confidence ?? 0) >= 0.7)
      .sort((a, b) => (b.confidence ?? 0) - (a.confidence ?? 0))[0];

  const negPct = data.sentiment.total > 0
    ? Math.round((data.sentiment.negative / data.sentiment.total) * 100)
    : 0;
  const posPct = data.sentiment.total > 0
    ? Math.round((data.sentiment.positive / data.sentiment.total) * 100)
    : 0;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "1.5rem" }}>

      {/* ── Fix These ── */}
      <div style={{ background: "#fff", border: "2px solid #fca5a5", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ background: "#fef2f2", borderBottom: "1px solid #fca5a5", padding: "14px 18px" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <span style={{ fontSize: "1.1rem" }}>🔴</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: "#991b1b" }}>Issues to Fix</div>
              <div style={{ fontSize: 12, color: "#b91c1c", marginTop: 1 }}>
                {negPct}% of reviews flag a problem — here&rsquo;s where customers are hurting
              </div>
            </div>
          </div>
        </div>
        <div style={{ padding: "14px 18px", display: "flex", flexDirection: "column", gap: 14 }}>
          {negativeThemes.length === 0 ? (
            <div style={{ fontSize: 13, color: "#64748b", fontStyle: "italic" }}>No significant negative themes detected.</div>
          ) : negativeThemes.map((t) => {
            const sample = byTheme(t.theme, -1);
            const action = NEGATIVE_ACTIONS[t.theme] ?? "Investigate root cause with customer interviews";
            return (
              <div key={t.theme}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <span style={{ fontWeight: 600, fontSize: 13, color: "#1e293b" }}>{formatTheme(t.theme)}</span>
                  <span style={{ fontSize: 12, background: "#fee2e2", color: "#991b1b", borderRadius: 20, padding: "1px 8px", fontWeight: 600 }}>
                    {t.count} mention{t.count !== 1 ? "s" : ""}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: "#64748b", marginBottom: sample ? 6 : 0 }}>
                  → {action}
                </div>
                {sample && (
                  <div style={{
                    fontSize: 12, color: "#475569", background: "#fef2f2",
                    borderLeft: "3px solid #f87171", borderRadius: "0 6px 6px 0",
                    padding: "6px 10px", lineHeight: 1.5, fontStyle: "italic",
                  }}>
                    &ldquo;{sample.text.slice(0, 110)}{sample.text.length > 110 ? "…" : ""}&rdquo;
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Marketing Ammunition ── */}
      <div style={{ background: "#fff", border: "2px solid #86efac", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ background: "#f0fdf4", borderBottom: "1px solid #86efac", padding: "14px 18px" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <span style={{ fontSize: "1.1rem" }}>🟢</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: "#166534" }}>Marketing Ammunition</div>
              <div style={{ fontSize: 12, color: "#15803d", marginTop: 1 }}>
                {posPct}% of reviews are praising — these themes make the best ads
              </div>
            </div>
          </div>
        </div>
        <div style={{ padding: "14px 18px", display: "flex", flexDirection: "column", gap: 14 }}>
          {positiveThemes.length === 0 ? (
            <div style={{ fontSize: 13, color: "#64748b", fontStyle: "italic" }}>No prominent positive themes detected.</div>
          ) : positiveThemes.map((t) => {
            const sample = byTheme(t.theme, 1);
            const play = POSITIVE_MARKETING[t.theme] ?? "Highlight in marketing copy and social proof";
            return (
              <div key={t.theme}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <span style={{ fontWeight: 600, fontSize: 13, color: "#1e293b" }}>{formatTheme(t.theme)}</span>
                  <span style={{ fontSize: 12, background: "#dcfce7", color: "#166534", borderRadius: 20, padding: "1px 8px", fontWeight: 600 }}>
                    {t.count} mention{t.count !== 1 ? "s" : ""}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: "#64748b", marginBottom: sample ? 6 : 0 }}>
                  → {play}
                </div>
                {sample && (
                  <div style={{
                    fontSize: 12, color: "#475569", background: "#f0fdf4",
                    borderLeft: "3px solid #4ade80", borderRadius: "0 6px 6px 0",
                    padding: "6px 10px", lineHeight: 1.5, fontStyle: "italic",
                  }}>
                    &ldquo;{sample.text.slice(0, 110)}{sample.text.length > 110 ? "…" : ""}&rdquo;
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DemoDashboardPage() {
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [step, setStep] = useState<Step>("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [classifyProgress, setClassifyProgress] = useState({ classified: 0, total: 0 });
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const esRef = useRef<EventSource | null>(null);

  function startAnalysis(brandId: string) {
    setSelectedBrand(brandId);
    setStep("checking");
    setData(null);
    setError(null);
    setClassifyProgress({ classified: 0, total: 0 });

    if (esRef.current) esRef.current.close();

    const es = new EventSource(`/api/demo/analyze?brand=${brandId}`);
    esRef.current = es;

    es.addEventListener("status", (e) => {
      const payload = JSON.parse(e.data);
      setStep(payload.step);
      setStatusMessage(payload.message || "");
      if (payload.step === "classifying") {
        setClassifyProgress({ classified: payload.classified, total: payload.total });
      }
    });

    es.addEventListener("done", (e) => {
      const payload = JSON.parse(e.data);
      setData(payload);
      setStep("done");
      es.close();
    });

    es.addEventListener("error", (e) => {
      try {
        const payload = JSON.parse((e as MessageEvent).data);
        setError(payload.message);
      } catch {
        setError("Connection lost");
      }
      setStep("error");
      es.close();
    });

    es.onerror = () => {
      if (step !== "done") {
        setError("Connection lost — please try again.");
        setStep("error");
      }
      es.close();
    };
  }

  useEffect(() => () => { esRef.current?.close(); }, []);

  const activeBrand = DEMO_BRANDS.find((b) => b.id === selectedBrand);

  // Split insights: issues first, then opportunities
  const issueInsights = data?.insights.filter((i) => i.type === "warning") ?? [];
  const opportunityInsights = data?.insights.filter((i) => i.type !== "warning") ?? [];

  return (
    <main className="container" style={{ padding: "2rem 1.5rem", maxWidth: 1100 }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <Link href="/" style={{ fontSize: 13, color: "#64748b", display: "inline-block", marginBottom: 12 }}>
          &larr; Back to home
        </Link>
        <div style={{ marginBottom: 8 }}>
          <Image src="/logo_wordmark.png" alt="Insight.me" width={200} height={56} style={{ height: 44, width: "auto" }} />
        </div>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>Live Demo</h1>
        <p style={{ color: "#64748b", fontSize: 14, maxWidth: 560 }}>
          Pick a real brand — we&rsquo;ll run their reviews through Claude AI and show you exactly{" "}
          <strong>what to fix</strong> and <strong>what to amplify in ads</strong>.
        </p>
      </div>

      {/* Brand selector */}
      <div className="card" style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Choose a brand</h2>
        <p style={{ fontSize: 13, color: "#64748b", marginBottom: 16 }}>
          All five are real merchants on judge.me. Select one to run a live analysis.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
          {DEMO_BRANDS.map((brand) => {
            const isSelected = selectedBrand === brand.id;
            const isRunning = isSelected && step !== "done" && step !== "idle" && step !== "error";
            return (
              <button
                key={brand.id}
                onClick={() => startAnalysis(brand.id)}
                disabled={isRunning}
                style={{
                  padding: "14px 16px",
                  background: isSelected ? "#eff6ff" : "#fff",
                  border: `2px solid ${isSelected ? "#2563eb" : "#e2e8f0"}`,
                  borderRadius: 10,
                  cursor: isRunning ? "default" : "pointer",
                  textAlign: "left",
                  transition: "border-color 0.15s, background 0.15s",
                  opacity: isRunning ? 0.75 : 1,
                }}
              >
                <div style={{ fontSize: "1.5rem", marginBottom: 6 }}>{brand.emoji}</div>
                <div style={{ fontWeight: 700, fontSize: 14, color: "#1e293b", marginBottom: 2 }}>{brand.name}</div>
                <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.4 }}>{brand.product}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Progress section */}
      {step !== "idle" && step !== "done" && (
        <div className="card" style={{ marginBottom: "2rem" }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>
            Analyzing {activeBrand?.name} Reviews
          </h2>
          <StepIndicator step="checking" current={step} label={`Connecting to ${activeBrand?.name ?? "store"}`} />
          <StepIndicator step="found" current={step} label="Loading reviews" detail={statusMessage} />
          <StepIndicator
            step="classifying"
            current={step}
            label="Classifying with Claude AI"
            detail={classifyProgress.total > 0 ? `${classifyProgress.classified} of ${classifyProgress.total} reviews` : undefined}
          />
          <StepIndicator step="done" current={step} label="Building dashboard" />

          {step === "classifying" && classifyProgress.total > 0 && (
            <div style={{ marginTop: 12, height: 6, background: "#f1f5f9", borderRadius: 3 }}>
              <div style={{
                height: "100%",
                width: `${(classifyProgress.classified / classifyProgress.total) * 100}%`,
                background: "#2563eb", borderRadius: 3, transition: "width 0.3s ease",
              }} />
            </div>
          )}

          {error && (
            <div style={{ marginTop: 12, padding: "10px 14px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, color: "#991b1b", fontSize: 13 }}>
              {error}
            </div>
          )}
        </div>
      )}

      {/* Dashboard */}
      {data && (
        <>
          {/* Store header */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1.5rem" }}>
            <span style={{ fontSize: "2rem" }}>{data.brandEmoji}</span>
            <div>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0 }}>{data.storeName}</h2>
              <div style={{ fontSize: 13, color: "#64748b" }}>{data.productName} &mdash; {data.sentiment.total} reviews classified</div>
            </div>
            <button
              onClick={() => { setData(null); setStep("idle"); setSelectedBrand(null); }}
              style={{ marginLeft: "auto", fontSize: 13, color: "#2563eb", background: "none", border: "1px solid #bfdbfe", borderRadius: 6, padding: "6px 14px", cursor: "pointer" }}
            >
              Try another brand
            </button>
          </div>

          {/* ── ACTION HUB: the money section ── */}
          <ActionHub data={data} />

          {/* Divider with context */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1.5rem" }}>
            <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
            <span style={{ fontSize: 12, color: "#94a3b8", whiteSpace: "nowrap" }}>Full breakdown</span>
            <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
          </div>

          {/* Stat cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
            <div className="card" style={{ textAlign: "center" }}>
              <div style={{ fontSize: 12, color: "#64748b", textTransform: "uppercase", fontWeight: 600, letterSpacing: 0.5 }}>Total Reviews</div>
              <div style={{ fontSize: "2rem", fontWeight: 700 }}>{data.sentiment.total}</div>
            </div>
            <div className="card" style={{ textAlign: "center" }}>
              <div style={{ fontSize: 12, color: "#64748b", textTransform: "uppercase", fontWeight: 600, letterSpacing: 0.5 }}>Positive — use in ads</div>
              <div style={{ fontSize: "2rem", fontWeight: 700, color: "#22c55e" }}>
                {data.sentiment.total > 0 ? Math.round((data.sentiment.positive / data.sentiment.total) * 100) : 0}%
              </div>
            </div>
            <div className="card" style={{ textAlign: "center" }}>
              <div style={{ fontSize: 12, color: "#64748b", textTransform: "uppercase", fontWeight: 600, letterSpacing: 0.5 }}>Negative — fix these</div>
              <div style={{ fontSize: "2rem", fontWeight: 700, color: "#ef4444" }}>
                {data.sentiment.total > 0 ? Math.round((data.sentiment.negative / data.sentiment.total) * 100) : 0}%
              </div>
            </div>
          </div>

          {/* Charts row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
            <div className="card">
              <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Sentiment Breakdown</h2>
              <SentimentChart positive={data.sentiment.positive} negative={data.sentiment.negative} neutral={data.sentiment.neutral} />
            </div>
            <div className="card">
              <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Top Themes</h2>
              <ThemesList themes={data.topThemes} limit={6} />
            </div>
          </div>

          {/* Week over week */}
          <div className="card" style={{ marginBottom: "1.5rem" }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Week over Week</h2>
            <WeekOverWeek data={data.weekOverWeek} />
          </div>

          {/* Insights: issues first, then opportunities */}
          {(issueInsights.length > 0 || opportunityInsights.length > 0) && (
            <div className="card" style={{ marginBottom: "1.5rem" }}>
              {issueInsights.length > 0 && (
                <>
                  <h2 style={{ fontSize: 15, fontWeight: 700, color: "#991b1b", marginBottom: 10 }}>
                    🔴 Issues Flagged by AI
                  </h2>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: opportunityInsights.length > 0 ? 16 : 0 }}>
                    {issueInsights.map((insight, i) => <InsightCard key={i} insight={insight} />)}
                  </div>
                </>
              )}
              {opportunityInsights.length > 0 && (
                <>
                  <h2 style={{ fontSize: 15, fontWeight: 700, color: "#166534", marginBottom: 10 }}>
                    🟢 Marketing Opportunities
                  </h2>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {opportunityInsights.map((insight, i) => <InsightCard key={i} insight={insight} />)}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Slack Digest Preview */}
          <div className="card" style={{ marginBottom: "1.5rem" }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>Slack Digest Preview</h2>
            <p style={{ fontSize: 13, color: "#64748b", marginBottom: 12 }}>
              This is what your team would see in Slack every morning.
            </p>
            <SlackDigestPreview storeName={data.storeName} sentiment={data.sentiment} topThemes={data.topThemes} />
          </div>

          {/* Reviews table — negative first */}
          <div className="card" style={{ marginBottom: "1.5rem" }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>All Reviews</h2>
            <p style={{ fontSize: 13, color: "#64748b", marginBottom: 12 }}>
              Sorted by sentiment — negative reviews first so you can act on them immediately.
            </p>
            <ReviewsList reviews={data.reviews} defaultSortKey="sentiment" defaultSortDir="asc" />
          </div>

          {/* CTA */}
          <div className="card" style={{ textAlign: "center", padding: "2.5rem 2rem" }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
              Ready to do this with your own reviews?
            </h2>
            <p style={{ color: "#64748b", marginBottom: 6, fontSize: 14, maxWidth: 440, margin: "0 auto 8px" }}>
              Connect your store and Insight.me will automatically classify every incoming review —
              surfacing what to fix and what to put in your next ad campaign.
            </p>
            <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 20 }}>
              Slack digest every morning. No manual work.
            </p>
            <a
              href="/api/oauth/authorize?shop=your-store.myshopify.com"
              style={{
                display: "inline-block", padding: "12px 32px",
                background: "#2563eb", color: "#fff",
                borderRadius: 8, fontWeight: 600, fontSize: 15,
                boxShadow: "0 4px 14px rgba(37,99,235,0.3)",
              }}
            >
              Connect Your Store
            </a>
          </div>
        </>
      )}
    </main>
  );
}
