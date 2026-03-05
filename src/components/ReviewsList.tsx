"use client";

import { useState } from "react";

interface Review {
  id: number;
  text: string;
  rating: number;
  theme: string | null;
  sentiment: number | null;
  confidence: number | null;
  createdAt: string;
}

interface ReviewsListProps {
  reviews: Review[];
  defaultSortKey?: SortKey;
  defaultSortDir?: "asc" | "desc";
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span style={{ color: "#f59e0b", fontSize: "0.875rem", letterSpacing: 1 }}>
      {"★".repeat(rating)}{"☆".repeat(5 - rating)}
    </span>
  );
}

function SentimentBadge({ sentiment }: { sentiment: number | null }) {
  if (sentiment === null) return <span className="badge badge-neutral">Unclassified</span>;
  if (sentiment === 1) return <span className="badge badge-positive">Positive</span>;
  if (sentiment === -1) return <span className="badge badge-negative">Negative</span>;
  return <span className="badge badge-neutral">Neutral</span>;
}

function formatThemeName(theme: string): string {
  return theme.replace(/^[CP]_/, "").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

type SortKey = "createdAt" | "theme" | "sentiment" | "rating";

export default function ReviewsList({ reviews, defaultSortKey = "createdAt", defaultSortDir = "desc" }: ReviewsListProps) {
  const [sortKey, setSortKey] = useState<SortKey>(defaultSortKey);
  const [sortDir, setSortDir] = useState<"asc" | "desc">(defaultSortDir);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  const sorted = [...reviews].sort((a, b) => {
    let cmp = 0;
    if (sortKey === "createdAt") {
      cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    } else if (sortKey === "theme") {
      cmp = (a.theme ?? "").localeCompare(b.theme ?? "");
    } else if (sortKey === "sentiment") {
      cmp = (a.sentiment ?? 0) - (b.sentiment ?? 0);
    } else if (sortKey === "rating") {
      cmp = a.rating - b.rating;
    }
    return sortDir === "asc" ? cmp : -cmp;
  });

  function toggleExpand(id: number) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  if (reviews.length === 0) {
    return <div style={{ color: "#94a3b8", fontSize: "0.875rem", padding: "1rem 0" }}>No reviews in this period</div>;
  }

  const SortIcon = ({ k }: { k: SortKey }) =>
    sortKey === k ? (sortDir === "asc" ? " ↑" : " ↓") : "";

  return (
    <div>
      {/* Sort controls */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap" }}>
        <span style={{ fontSize: "0.75rem", color: "#64748b", alignSelf: "center" }}>Sort:</span>
        {(["createdAt", "theme", "sentiment", "rating"] as SortKey[]).map((k) => (
          <button
            key={k}
            onClick={() => handleSort(k)}
            style={{
              padding: "4px 10px",
              borderRadius: 6,
              border: "1px solid #e2e8f0",
              background: sortKey === k ? "#2563eb" : "#fff",
              color: sortKey === k ? "#fff" : "#475569",
              fontSize: "0.75rem",
              cursor: "pointer",
              fontWeight: sortKey === k ? 600 : 400,
            }}
          >
            {k === "createdAt" ? "Date" : k.charAt(0).toUpperCase() + k.slice(1)}
            <SortIcon k={k} />
          </button>
        ))}
      </div>

      {/* Reviews */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {sorted.map((r) => {
          const isExpanded = expanded.has(r.id);
          const preview = r.text.length > 120 && !isExpanded ? r.text.slice(0, 120) + "…" : r.text;

          return (
            <div
              key={r.id}
              style={{
                padding: "0.875rem 1rem",
                background: "#f8fafc",
                borderRadius: 8,
                border: "1px solid #e2e8f0",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem", gap: "0.5rem", flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <StarRating rating={r.rating} />
                  <SentimentBadge sentiment={r.sentiment} />
                  {r.theme && (
                    <span style={{ fontSize: "0.75rem", color: "#2563eb", fontWeight: 500 }}>
                      {formatThemeName(r.theme)}
                    </span>
                  )}
                </div>
                <span style={{ fontSize: "0.75rem", color: "#94a3b8", whiteSpace: "nowrap" }}>
                  {new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>

              <p style={{ fontSize: "0.875rem", color: "#334155", lineHeight: 1.6 }}>{preview}</p>

              {r.text.length > 120 && (
                <button
                  onClick={() => toggleExpand(r.id)}
                  style={{ marginTop: "0.25rem", fontSize: "0.75rem", color: "#2563eb", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                >
                  {isExpanded ? "Show less" : "Show more"}
                </button>
              )}

              {r.confidence !== null && (
                <div style={{ marginTop: "0.5rem", fontSize: "0.7rem", color: "#94a3b8" }}>
                  Confidence: {Math.round(r.confidence * 100)}%
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
