"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

const CATEGORIES = [
  { value: "apparel", label: "Apparel & Clothing" },
  { value: "electronics", label: "Electronics" },
  { value: "home_garden", label: "Home & Garden" },
  { value: "beauty", label: "Beauty & Personal Care" },
  { value: "sports", label: "Sports & Outdoors" },
  { value: "food_beverage", label: "Food & Beverage" },
  { value: "toys_games", label: "Toys & Games" },
  { value: "pet_supplies", label: "Pet Supplies" },
  { value: "general", label: "General / Other" },
];

function OnboardingForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const storeId = searchParams.get("storeId");

  const [category, setCategory] = useState("general");
  const [slackWebhook, setSlackWebhook] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!storeId) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/stores/${storeId}/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productCategory: category,
          slackWebhookUrl: slackWebhook,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to save settings");
      }

      router.push(`/dashboard/${storeId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  if (!storeId) {
    return <div style={{ color: "#ef4444" }}>Missing store ID. Please reconnect your store.</div>;
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 480, width: "100%" }}>
      <h1 style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: "0.5rem" }}>
        Almost there!
      </h1>
      <p style={{ color: "#64748b", marginBottom: "2rem" }}>
        Configure Insight.me for your store.
      </p>

      <div style={{ marginBottom: "1.5rem" }}>
        <label style={{ display: "block", fontWeight: 600, marginBottom: "0.5rem" }}>
          Product Category
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{ width: "100%", padding: "0.625rem 0.75rem", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: "1rem" }}
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
        <p style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.25rem" }}>
          This helps Claude classify reviews with the right context.
        </p>
      </div>

      <div style={{ marginBottom: "2rem" }}>
        <label style={{ display: "block", fontWeight: 600, marginBottom: "0.5rem" }}>
          Slack Webhook URL <span style={{ fontWeight: 400, color: "#94a3b8" }}>(optional)</span>
        </label>
        <input
          type="url"
          value={slackWebhook}
          onChange={(e) => setSlackWebhook(e.target.value)}
          placeholder="https://hooks.slack.com/services/..."
          style={{ width: "100%", padding: "0.625rem 0.75rem", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: "1rem" }}
        />
        <p style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.25rem" }}>
          We'll send daily sentiment digests to this webhook.
        </p>
      </div>

      {error && (
        <div style={{ padding: "0.75rem", background: "#fee2e2", borderRadius: 8, color: "#991b1b", fontSize: "0.875rem", marginBottom: "1rem" }}>
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        style={{
          width: "100%",
          padding: "0.75rem",
          background: loading ? "#94a3b8" : "#2563eb",
          color: "#fff",
          borderRadius: 8,
          border: "none",
          fontWeight: 600,
          fontSize: "1rem",
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Saving..." : "Go to Dashboard"}
      </button>
    </form>
  );
}

export default function OnboardingPage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <Suspense fallback={<div>Loading...</div>}>
        <OnboardingForm />
      </Suspense>
    </div>
  );
}
