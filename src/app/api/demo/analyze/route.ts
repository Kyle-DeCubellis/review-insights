import { NextRequest } from "next/server";
import { classifyReview } from "@/lib/classifier";

const JUDGEME_BASE = "https://judge.me/api/v1";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function normalizeDomain(input: string): string {
  let d = input.trim().toLowerCase();
  d = d.replace(/^https?:\/\//, "");
  d = d.replace(/^www\./, "");
  d = d.split("/")[0];
  // If no dot at all, assume *.myshopify.com
  if (!d.includes(".")) d = `${d}.myshopify.com`;
  return d;
}

/** Try to pull the Judge.me public api_token out of the store's HTML. */
async function extractPublicToken(shopDomain: string): Promise<string | null> {
  try {
    const res = await fetch(`https://${shopDomain}`, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; ReviewInsightsBot/1.0)" },
      signal: AbortSignal.timeout(8_000),
    });
    if (!res.ok) return null;
    const html = await res.text();

    const patterns = [
      /api_token["']?\s*[:=]\s*["']([a-zA-Z0-9_\-]{10,})["']/,
      /jdgm[._]?api[._]?token["']?\s*[:=]\s*["']([a-zA-Z0-9_\-]{10,})["']/i,
      /"shopToken"\s*:\s*"([a-zA-Z0-9_\-]{10,})"/,
      /JudgeMeWidget\.init\([^)]*api_token\s*:\s*["']([a-zA-Z0-9_\-]{10,})["']/,
      /jdgm-all-reviews[^>]*data-api-token=["']([a-zA-Z0-9_\-]{10,})["']/,
    ];

    for (const p of patterns) {
      const m = html.match(p);
      if (m) return m[1];
    }
    return null;
  } catch {
    return null;
  }
}

interface JudgeMeReview {
  id: number;
  body: string;
  rating: number;
  created_at: string;
  hidden: boolean;
  reviewer?: { name?: string };
  product_handle?: string | null;
}

interface JudgeMeResponse {
  reviews: JudgeMeReview[];
  total_count: number;
}

async function fetchReviews(
  shopDomain: string,
  apiToken: string,
  perPage = 50
): Promise<JudgeMeResponse | null> {
  try {
    const params = new URLSearchParams({
      api_token: apiToken,
      shop_domain: shopDomain,
      page: "1",
      per_page: String(Math.min(perPage, 100)),
    });
    const res = await fetch(`${JUDGEME_BASE}/reviews?${params}`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(12_000),
    });
    if (!res.ok) return null;
    return res.json() as Promise<JudgeMeResponse>;
  } catch {
    return null;
  }
}

/** Badge endpoint works without auth — tells us if the store has Judge.me. */
async function checkBadge(shopDomain: string): Promise<{ count?: number; average?: number } | null> {
  try {
    const res = await fetch(`${JUDGEME_BASE}/badges?shop_domain=${encodeURIComponent(shopDomain)}`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(8_000),
    });
    if (!res.ok) return null;
    const json = await res.json() as Record<string, unknown>;
    // Normalize fields across API versions
    const count = (json.count ?? json.review_count ?? json.reviews_count) as number | undefined;
    const average = (json.average ?? json.average_rating ?? json.rating) as number | undefined;
    return { count, average };
  } catch {
    return null;
  }
}

// ─── Aggregation ─────────────────────────────────────────────────────────────

interface ClassifiedReview {
  id: number;
  text: string;
  rating: number;
  createdAt: string;
  theme: string | null;
  sentiment: number | null;
  confidence: number | null;
}

function buildDashboardData(
  shopDomain: string,
  reviews: JudgeMeReview[],
  classifications: (Awaited<ReturnType<typeof classifyReview>> | null)[]
) {
  let positive = 0, negative = 0, neutral = 0;
  const themeCounts: Record<string, { count: number; sentimentSum: number }> = {};

  classifications.forEach((c) => {
    if (!c) return;
    if (c.sentiment === 1) positive++;
    else if (c.sentiment === -1) negative++;
    else neutral++;
    if (!themeCounts[c.theme]) themeCounts[c.theme] = { count: 0, sentimentSum: 0 };
    themeCounts[c.theme].count++;
    themeCounts[c.theme].sentimentSum += c.sentiment;
  });

  const topThemes = Object.entries(themeCounts)
    .map(([theme, { count, sentimentSum }]) => ({
      theme,
      count,
      avgSentiment: Math.round((sentimentSum / count) * 100) / 100,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const total = positive + negative + neutral;
  const positivePct = total > 0 ? Math.round((positive / total) * 100) : 0;

  // Build a Slack-style digest snippet
  const formatTheme = (t: string) =>
    t.replace(/^[CP]_/, "").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const digestLines = [
    `📊 *Review Digest — ${shopDomain}*`,
    `>${total} reviews analysed · ${positivePct}% positive sentiment`,
    `>`,
    `>*Top themes identified by Claude:*`,
    ...topThemes.slice(0, 5).map((t, i) => {
      const emoji = t.avgSentiment > 0.2 ? "🟢" : t.avgSentiment < -0.2 ? "🔴" : "🟡";
      const sentiment = t.avgSentiment > 0 ? `+${t.avgSentiment.toFixed(2)}` : t.avgSentiment.toFixed(2);
      return `>${i + 1}. ${emoji} *${formatTheme(t.theme)}* — ${t.count} mention${t.count !== 1 ? "s" : ""} (avg sentiment ${sentiment})`;
    }),
    `>`,
    `>_Powered by Review Insights · Claude Sonnet 4.6_`,
  ];

  const recentReviews: ClassifiedReview[] = reviews.slice(0, 20).map((r, i) => ({
    id: r.id,
    text: r.body || "(no review text)",
    rating: r.rating,
    createdAt: r.created_at,
    theme: classifications[i]?.theme ?? null,
    sentiment: classifications[i]?.sentiment ?? null,
    confidence: classifications[i]?.confidence ?? null,
  }));

  return {
    shopDomain,
    sentiment: { positive, negative, neutral, total },
    topThemes,
    recentReviews,
    digest: digestLines.join("\n"),
  };
}

// ─── SSE helpers ─────────────────────────────────────────────────────────────

function sseEvent(data: object): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`);
}

// ─── Route handler ────────────────────────────────────────────────────────────

export const maxDuration = 60; // Vercel Pro: up to 60s for streaming

export async function GET(request: NextRequest) {
  const rawShop = request.nextUrl.searchParams.get("shop") ?? "";

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => controller.enqueue(sseEvent(data));

      try {
        // ── 1. Validate & normalise domain ───────────────────────────
        const shopDomain = normalizeDomain(rawShop);
        if (!shopDomain || shopDomain.length < 5) {
          send({ step: "error", message: "Please enter a valid Shopify store URL." });
          controller.close();
          return;
        }

        send({ step: "checking", message: `Checking ${shopDomain} for Judge.me reviews…` });

        // ── 2. Badge check — confirms Judge.me is installed ──────────
        const badge = await checkBadge(shopDomain);

        // ── 3. Try to get public API token from store HTML ───────────
        send({ step: "fetching", message: "Fetching reviews from Judge.me…" });
        const publicToken = await extractPublicToken(shopDomain);

        let reviews: JudgeMeReview[] = [];
        let totalCount = 0;

        // Try with extracted token first, then empty string
        for (const token of [publicToken ?? "", ""]) {
          if (token === "" && reviews.length > 0) break;
          const data = await fetchReviews(shopDomain, token);
          if (data?.reviews?.length) {
            reviews = data.reviews.filter((r) => !r.hidden && r.body?.trim().length > 0);
            totalCount = data.total_count;
            break;
          }
        }

        // ── 4. Determine result ──────────────────────────────────────
        if (reviews.length === 0 && !badge) {
          send({
            step: "error",
            message: `We couldn't detect Judge.me on ${shopDomain}. Make sure the store has Judge.me installed with public reviews enabled.`,
          });
          controller.close();
          return;
        }

        if (reviews.length === 0 && badge) {
          send({
            step: "error",
            message: `${shopDomain} uses Judge.me (${badge.count?.toLocaleString() ?? "some"} reviews, avg ${badge.average?.toFixed(1) ?? "?"} ★) but their reviews aren't publicly accessible without OAuth. Connect your store to unlock the full dashboard.`,
          });
          controller.close();
          return;
        }

        send({ step: "found", count: reviews.length, total: totalCount, shopDomain });

        // ── 5. Classify up to 15 reviews (3 batches of 5) ───────────
        const toClassify = reviews.slice(0, 15);
        const classifications: (Awaited<ReturnType<typeof classifyReview>> | null)[] = [];

        for (let i = 0; i < toClassify.length; i += 5) {
          const chunk = toClassify.slice(i, i + 5);
          const results = await Promise.all(
            chunk.map((r) => classifyReview(r.body, "general").catch(() => null))
          );
          classifications.push(...results);
          send({
            step: "classifying",
            progress: Math.min(i + 5, toClassify.length),
            total: toClassify.length,
          });
        }

        // ── 6. Build & stream final dashboard data ───────────────────
        const data = buildDashboardData(shopDomain, toClassify, classifications);
        send({ step: "done", data });
      } catch (err) {
        send({
          step: "error",
          message: err instanceof Error ? err.message : "An unexpected error occurred.",
        });
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no", // Disable Nginx buffering
    },
  });
}
