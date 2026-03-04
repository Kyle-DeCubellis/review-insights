"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import SentimentChart from "@/components/SentimentChart";
import ThemesList from "@/components/ThemesList";
import ReviewsList from "@/components/ReviewsList";

// ─── Types ────────────────────────────────────────────────────────────────────

type Step =
  | { type: "idle" }
  | { type: "checking"; message: string }
  | { type: "fetching"; message: string }
  | { type: "found"; count: number; total: number; shopDomain: string }
  | { type: "classifying"; progress: number; total: number }
  | { type: "done"; data: DemoResult }
  | { type: "error"; message: string };

interface DemoResult {
  shopDomain: string;
  sentiment: { positive: number; negative: number; neutral: number; total: number };
  topThemes: { theme: string; count: number; avgSentiment: number }[];
  recentReviews: {
    id: number;
    text: string;
    rating: number;
    createdAt: string;
    theme: string | null;
    sentiment: number | null;
    confidence: number | null;
  }[];
  digest: string;
}

// ─── Shared style tokens ──────────────────────────────────────────────────────

const BLUE = "#2563eb";
const GREEN = "#22c55e";
const RED = "#ef4444";
const SLATE = "#64748b";

// ─── Sub-components ───────────────────────────────────────────────────────────

function StepRow({ done, active, children }: { done: boolean; active: boolean; children: React.ReactNode }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "0.75rem",
      padding: "0.75rem 1rem",
      borderRadius: 10,
      background: done ? "#f0fdf4" : active ? "#eff6ff" : "#f8fafc",
      border: `1px solid ${done ? "#bbf7d0" : active ? "#bfdbfe" : "#e2e8f0"}`,
      transition: "all 0.25s",
    }}>
      <div style={{
        width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
        background: done ? GREEN : active ? BLUE : "#e2e8f0",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: done || active ? "#fff" : SLATE,
        fontSize: "0.875rem", fontWeight: 700,
        transition: "background 0.25s",
      }}>
        {done ? "✓" : active ? <Spinner /> : "·"}
      </div>
      <span style={{
        fontSize: "0.9375rem",
        color: done ? "#15803d" : active ? "#1d4ed8" : SLATE,
        fontWeight: done || active ? 600 : 400,
      }}>
        {children}
      </span>
    </div>
  );
}

function Spinner() {
  return (
    <span style={{
      display: "inline-block",
      width: 14, height: 14,
      border: "2px solid rgba(255,255,255,0.4)",
      borderTopColor: "#fff",
      borderRadius: "50%",
      animation: "spin 0.7s linear infinite",
    }} />
  );
}

function DigestPreview({ text }: { text: string }) {
  const formatLine = (line: string, i: number) => {
    // Title line
    if (i === 0) return (
      <div key={i} style={{ fontWeight: 700, fontSize: "1rem", marginBottom: "0.375rem", color: "#e2e8f0" }}>
        {line.replace(/\*/g, "")}
      </div>
    );
    // Quote lines (start with >)
    if (line.startsWith(">")) {
      const inner = line.slice(1).trim();
      if (!inner) return <div key={i} style={{ height: "0.5rem" }} />;
      // Bold sections
      const formatted = inner.split(/\*([^*]+)\*/).map((part, j) =>
        j % 2 === 1
          ? <strong key={j} style={{ color: "#f1f5f9" }}>{part}</strong>
          : <span key={j}>{part}</span>
      );
      return (
        <div key={i} style={{
          borderLeft: "3px solid #475569",
          paddingLeft: "0.75rem",
          marginBottom: "0.25rem",
          fontSize: "0.875rem",
          color: "#94a3b8",
          lineHeight: 1.6,
        }}>
          {formatted}
        </div>
      );
    }
    return <div key={i} style={{ fontSize: "0.875rem", color: "#94a3b8" }}>{line}</div>;
  };

  return (
    <div style={{
      background: "#1e293b",
      borderRadius: 12,
      padding: "1.25rem 1.5rem",
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      border: "1px solid #334155",
    }}>
      <div style={{
        fontSize: "0.7rem", fontWeight: 700, letterSpacing: 1.5,
        color: "#475569", textTransform: "uppercase", marginBottom: "0.875rem",
      }}>
        Slack Digest Preview
      </div>
      {text.split("\n").map((line, i) => formatLine(line, i))}
    </div>
  );
}

// ─── Main analysis UI ─────────────────────────────────────────────────────────

function AnalyzeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [inputVal, setInputVal] = useState(searchParams.get("shop") ?? "");
  const [step, setStep] = useState<Step>({ type: "idle" });
  const esRef = useRef<EventSource | null>(null);

  const isRunning = ["checking", "fetching", "found", "classifying"].includes(step.type);
  const isDone = step.type === "done";
  const isError = step.type === "error";

  function startAnalysis(shop: string) {
    if (!shop.trim()) return;
    // Cancel any in-flight stream
    esRef.current?.close();

    setStep({ type: "checking", message: `Checking ${shop}…` });

    const url = `/api/demo/analyze?shop=${encodeURIComponent(shop.trim())}`;
    const es = new EventSource(url);
    esRef.current = es;

    es.onmessage = (e) => {
      try {
        const event = JSON.parse(e.data) as Record<string, unknown>;
        const s = event.step as string;

        if (s === "checking") setStep({ type: "checking", message: event.message as string });
        else if (s === "fetching") setStep({ type: "fetching", message: event.message as string });
        else if (s === "found") setStep({ type: "found", count: event.count as number, total: event.total as number, shopDomain: event.shopDomain as string });
        else if (s === "classifying") setStep({ type: "classifying", progress: event.progress as number, total: event.total as number });
        else if (s === "done") {
          setStep({ type: "done", data: event.data as DemoResult });
          es.close();
        } else if (s === "error") {
          setStep({ type: "error", message: event.message as string });
          es.close();
        }
      } catch {
        // ignore parse errors
      }
    };

    es.onerror = () => {
      setStep({ type: "error", message: "Connection lost. Please try again." });
      es.close();
    };
  }

  // Auto-start if ?shop= is pre-populated
  useEffect(() => {
    const shop = searchParams.get("shop");
    if (shop) {
      setInputVal(shop);
      startAnalysis(shop);
    }
    return () => esRef.current?.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Update URL so the link is shareable
    router.replace(`/dashboard/demo?shop=${encodeURIComponent(inputVal.trim())}`, { scroll: false });
    startAnalysis(inputVal);
  }

  // ── Step state helpers ────────────────────────────────────────────────────
  const past = (types: string[]) => types.some((t) => {
    const order = ["checking", "fetching", "found", "classifying", "done"];
    return order.indexOf(step.type) > order.indexOf(t);
  });
  const active = (t: string) => step.type === t;
  const stepDone = (t: string) => {
    const order = ["checking", "fetching", "found", "classifying", "done"];
    return order.indexOf(step.type) > order.indexOf(t);
  };

  const classifyingProgress = step.type === "classifying"
    ? `AI classifying reviews with Claude… (${step.progress}/${step.total})`
    : step.type === "done"
    ? `AI classified all reviews with Claude`
    : "AI classification";

  const foundMessage = step.type === "found"
    ? `Found ${step.count} public reviews (${step.total.toLocaleString()} total in store)`
    : stepDone("found") || step.type === "classifying" || step.type === "done"
    ? `Reviews fetched successfully`
    : (step.type === "fetching" ? step.message : "Fetch reviews from Judge.me");

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", display: "flex", flexDirection: "column" }}>

      {/* ── Header ─────────────────────────────────────────────────── */}
      <header style={{
        background: "#fff",
        borderBottom: "1px solid #e2e8f0",
        padding: "1rem 0",
        position: "sticky", top: 0, zIndex: 40,
      }}>
        <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.5rem", textDecoration: "none" }}>
            <div style={{
              width: 30, height: 30, borderRadius: 7,
              background: "linear-gradient(135deg, #2563eb, #7c3aed)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontWeight: 800, fontSize: "0.9375rem",
            }}>R</div>
            <span style={{ fontWeight: 700, color: "#0f172a" }}>Review Insights</span>
          </Link>
          <span style={{
            fontSize: "0.75rem", fontWeight: 600,
            background: "#eff6ff", color: BLUE,
            padding: "0.25rem 0.625rem", borderRadius: 999,
            border: "1px solid #bfdbfe",
          }}>
            Live Store Analyser
          </span>
        </div>
      </header>

      <main className="container" style={{ padding: "2.5rem 1.5rem", flex: 1 }}>

        {/* ── Search form ──────────────────────────────────────────── */}
        <div className="card" style={{ marginBottom: "1.5rem", maxWidth: 680, margin: "0 auto 2rem" }}>
          <h1 style={{ fontSize: "1.375rem", fontWeight: 800, marginBottom: "0.375rem", color: "#0f172a" }}>
            Analyse any Judge.me store — live
          </h1>
          <p style={{ color: SLATE, fontSize: "0.9375rem", marginBottom: "1.25rem", lineHeight: 1.6 }}>
            Enter a Shopify store URL. We&apos;ll check for Judge.me reviews, classify them with Claude AI in real-time,
            and build a prototype dashboard — no sign-up required.
          </p>

          <form onSubmit={handleSubmit} style={{ display: "flex", gap: "0.625rem" }}>
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="mystore.myshopify.com"
              disabled={isRunning}
              style={{
                flex: 1,
                padding: "0.75rem 1rem",
                borderRadius: 9,
                border: "1.5px solid #e2e8f0",
                fontSize: "0.9375rem",
                color: "#0f172a",
                background: isRunning ? "#f8fafc" : "#fff",
                outline: "none",
              }}
            />
            <button
              type="submit"
              disabled={isRunning || !inputVal.trim()}
              style={{
                padding: "0.75rem 1.375rem",
                background: isRunning ? "#94a3b8" : BLUE,
                color: "#fff",
                borderRadius: 9,
                fontWeight: 700,
                fontSize: "0.9375rem",
                border: "none",
                cursor: isRunning ? "not-allowed" : "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {isRunning ? "Analysing…" : "Analyse Store →"}
            </button>
          </form>
        </div>

        {/* ── Progress steps ────────────────────────────────────────── */}
        {step.type !== "idle" && !isDone && (
          <div style={{ maxWidth: 680, margin: "0 auto 2rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <StepRow done={stepDone("checking")} active={active("checking")}>
              {active("checking") ? (step as { message: string }).message : "Check Judge.me installation"}
            </StepRow>

            <StepRow done={stepDone("fetching") || stepDone("found")} active={active("fetching") || active("found")}>
              {foundMessage}
            </StepRow>

            <StepRow done={stepDone("classifying")} active={active("classifying")}>
              {classifyingProgress}
            </StepRow>

            <StepRow done={isDone} active={false}>
              Build dashboard &amp; digest
            </StepRow>
          </div>
        )}

        {/* ── Error ─────────────────────────────────────────────────── */}
        {isError && (
          <div style={{
            maxWidth: 680, margin: "0 auto 2rem",
            padding: "1.25rem 1.5rem",
            background: "#fef2f2", borderRadius: 12, border: "1px solid #fecaca",
          }}>
            <div style={{ fontWeight: 700, color: "#b91c1c", marginBottom: "0.375rem" }}>
              Could not analyse store
            </div>
            <div style={{ color: "#991b1b", fontSize: "0.9375rem", lineHeight: 1.6 }}>
              {(step as { message: string }).message}
            </div>
            <div style={{ marginTop: "1rem", fontSize: "0.875rem", color: "#64748b" }}>
              Try a store like <code style={{ background: "#f1f5f9", padding: "0 4px", borderRadius: 4 }}>allbirds.myshopify.com</code> or{" "}
              <code style={{ background: "#f1f5f9", padding: "0 4px", borderRadius: 4 }}>gymshark.myshopify.com</code>
            </div>
          </div>
        )}

        {/* ── Dashboard result ─────────────────────────────────────── */}
        {isDone && (() => {
          const d = (step as { data: DemoResult }).data;
          const positivePct = d.sentiment.total > 0
            ? Math.round((d.sentiment.positive / d.sentiment.total) * 100) : 0;
          const negativePct = d.sentiment.total > 0
            ? Math.round((d.sentiment.negative / d.sentiment.total) * 100) : 0;

          return (
            <>
              {/* Success banner */}
              <div style={{
                maxWidth: 680, margin: "0 auto 2rem",
                padding: "1rem 1.25rem",
                background: "#f0fdf4", borderRadius: 10, border: "1px solid #bbf7d0",
                display: "flex", alignItems: "center", gap: "0.75rem",
              }}>
                <span style={{ fontSize: "1.375rem" }}>✅</span>
                <div>
                  <div style={{ fontWeight: 700, color: "#15803d" }}>Analysis complete — {d.shopDomain}</div>
                  <div style={{ fontSize: "0.875rem", color: "#166534" }}>
                    {d.recentReviews.length} reviews classified by Claude AI · {d.topThemes.length} themes identified
                  </div>
                </div>
                <button
                  onClick={() => { setStep({ type: "idle" }); setInputVal(""); router.replace("/dashboard/demo", { scroll: false }); }}
                  style={{
                    marginLeft: "auto", padding: "0.4rem 0.875rem",
                    background: "#dcfce7", color: "#15803d",
                    border: "1px solid #bbf7d0", borderRadius: 7,
                    fontWeight: 600, fontSize: "0.8125rem", cursor: "pointer",
                  }}
                >
                  Try another store
                </button>
              </div>

              {/* Stat cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
                {[
                  { label: "Reviews analysed", value: d.sentiment.total, color: BLUE },
                  { label: "Positive sentiment", value: `${positivePct}%`, color: GREEN },
                  { label: "Negative sentiment", value: `${negativePct}%`, color: RED },
                ].map((s) => (
                  <div key={s.label} className="card" style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "2rem", fontWeight: 800, color: s.color }}>{s.value}</div>
                    <div style={{ fontSize: "0.875rem", color: SLATE, marginTop: "0.25rem" }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Chart + Themes */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
                <div className="card">
                  <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1.25rem" }}>Sentiment Breakdown</h2>
                  <Suspense fallback={<div style={{ height: 220 }} />}>
                    <SentimentChart
                      positive={d.sentiment.positive}
                      negative={d.sentiment.negative}
                      neutral={d.sentiment.neutral}
                    />
                  </Suspense>
                </div>
                <div className="card">
                  <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1.25rem" }}>Top Themes</h2>
                  <ThemesList themes={d.topThemes} limit={6} />
                </div>
              </div>

              {/* Digest preview */}
              <div className="card" style={{ marginBottom: "1.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "1.125rem" }}>
                  <h2 style={{ fontSize: "1rem", fontWeight: 600 }}>Slack Digest Preview</h2>
                  <span style={{
                    fontSize: "0.7rem", fontWeight: 600, padding: "0.2rem 0.5rem",
                    background: "#f0fdf4", color: "#15803d",
                    borderRadius: 999, border: "1px solid #bbf7d0",
                  }}>
                    Generated by Claude
                  </span>
                </div>
                <p style={{ fontSize: "0.875rem", color: SLATE, marginBottom: "1rem", lineHeight: 1.6 }}>
                  This is the daily digest message that would be posted to your Slack channel after connecting your store.
                </p>
                <DigestPreview text={d.digest} />
              </div>

              {/* Reviews list */}
              <div className="card" style={{ marginBottom: "2rem" }}>
                <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1.25rem" }}>
                  Classified Reviews
                  <span style={{ fontWeight: 400, color: SLATE, marginLeft: 8, fontSize: "0.875rem" }}>
                    {d.recentReviews.length} shown
                  </span>
                </h2>
                <Suspense fallback={<div style={{ color: "#94a3b8" }}>Loading…</div>}>
                  <ReviewsList reviews={d.recentReviews} />
                </Suspense>
              </div>

              {/* Connect CTA */}
              <div style={{
                background: "linear-gradient(135deg, #1e3a8a, #2563eb)",
                borderRadius: 16, padding: "2.5rem 2rem", textAlign: "center", color: "#fff",
                marginBottom: "2rem",
              }}>
                <h3 style={{ fontSize: "1.375rem", fontWeight: 800, marginBottom: "0.75rem" }}>
                  Like what you see?
                </h3>
                <p style={{ color: "rgba(255,255,255,0.8)", marginBottom: "1.75rem", fontSize: "1rem", lineHeight: 1.6 }}>
                  Connect your Judge.me store for a full live dashboard, automated daily classification,
                  and Slack digests — every morning, automatically.
                </p>
                <a
                  href={`/api/oauth/authorize?shop=${encodeURIComponent(d.shopDomain)}`}
                  style={{
                    display: "inline-block",
                    padding: "0.875rem 2rem",
                    background: "#fff",
                    color: "#1e3a8a",
                    borderRadius: 10,
                    fontWeight: 700,
                    fontSize: "1rem",
                    textDecoration: "none",
                    boxShadow: "0 4px 14px rgba(0,0,0,0.18)",
                  }}
                >
                  Connect {d.shopDomain} →
                </a>
              </div>
            </>
          );
        })()}
      </main>

      {/* ── Spinner keyframe ──────────────────────────────────────── */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

export default function DemoPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8" }}>
        Loading…
      </div>
    }>
      <AnalyzeContent />
    </Suspense>
  );
}
