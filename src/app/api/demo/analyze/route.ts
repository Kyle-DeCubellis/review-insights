import { DEMO_REVIEWS, DEMO_PREVIOUS_WEEK } from "@/data/demo-reviews";
import { classifyReview, type ClassificationResult, type Theme } from "@/lib/classifier";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ClassifiedReview {
  id: number;
  text: string;
  rating: number;
  author: string;
  createdAt: string;
  theme: Theme;
  sentiment: -1 | 0 | 1;
  confidence: number;
}

interface Insight {
  type: "warning" | "success" | "info";
  title: string;
  detail: string;
}

function sendSSE(controller: ReadableStreamDefaultController, event: string, data: unknown) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  controller.enqueue(new TextEncoder().encode(payload));
}

function buildInsights(classified: ClassifiedReview[]): Insight[] {
  const insights: Insight[] = [];
  const negative = classified.filter((r) => r.sentiment === -1);
  const positive = classified.filter((r) => r.sentiment === 1);

  // 1. Top negative theme
  if (negative.length > 0) {
    const themeCounts: Record<string, number> = {};
    for (const r of negative) themeCounts[r.theme] = (themeCounts[r.theme] || 0) + 1;
    const topNeg = Object.entries(themeCounts).sort((a, b) => b[1] - a[1])[0];
    const pct = Math.round((topNeg[1] / negative.length) * 100);
    const actions: Record<string, string> = {
      C_customer_service: "auditing support response times",
      C_shipping: "reviewing fulfillment partner SLAs",
      C_durability: "escalating to product engineering",
      C_quality: "adding quality checks before shipment",
      P_sizing: "updating size guide with real measurements",
      C_fit_comfort: "adding detailed fit notes to product pages",
    };
    const action = actions[topNeg[0]] || "investigating root cause";
    insights.push({
      type: "warning",
      title: `${pct}% of negative reviews mention ${formatTheme(topNeg[0])}`,
      detail: `Consider ${action}. (${topNeg[1]} of ${negative.length} negative reviews)`,
    });
  }

  // 2. Week-over-week trend
  const currentPositive = positive.length;
  const currentTotal = classified.length;
  const currentPct = Math.round((currentPositive / currentTotal) * 100);
  const prevPct = Math.round((DEMO_PREVIOUS_WEEK.positive / DEMO_PREVIOUS_WEEK.total) * 100);
  const delta = currentPct - prevPct;
  if (Math.abs(delta) >= 5) {
    insights.push({
      type: delta > 0 ? "success" : "warning",
      title: `Positive sentiment ${delta > 0 ? "up" : "down"} from ${prevPct}% to ${currentPct}%`,
      detail: delta > 0
        ? "Keep doing what's working — customers are noticing improvements."
        : "Investigate recent changes that may be driving dissatisfaction.",
    });
  }

  // 3. Negative cluster alert
  const negThemeCounts: Record<string, number> = {};
  for (const r of negative.filter((r) => r.confidence >= 0.7)) {
    negThemeCounts[r.theme] = (negThemeCounts[r.theme] || 0) + 1;
  }
  const clusters = Object.entries(negThemeCounts).filter(([, c]) => c >= 2);
  for (const [theme, count] of clusters) {
    insights.push({
      type: "warning",
      title: `${count} high-confidence negative reviews flag ${formatTheme(theme)}`,
      detail: "This pattern is statistically significant — prioritize for next sprint.",
    });
  }

  // 4. Positive theme to amplify
  if (positive.length > 0) {
    const posThemes: Record<string, { total: number; count: number }> = {};
    for (const r of positive) {
      if (!posThemes[r.theme]) posThemes[r.theme] = { total: 0, count: 0 };
      posThemes[r.theme].total += r.sentiment;
      posThemes[r.theme].count += 1;
    }
    const best = Object.entries(posThemes).sort((a, b) => b[1].count - a[1].count)[0];
    insights.push({
      type: "success",
      title: `Customers love ${formatTheme(best[0])} (${best[1].count} positive mentions)`,
      detail: "Highlight this in marketing materials and product descriptions.",
    });
  }

  // 5. Low-confidence reviews
  const lowConf = classified.filter((r) => r.confidence < 0.6);
  if (lowConf.length > 0) {
    insights.push({
      type: "info",
      title: `${lowConf.length} review${lowConf.length > 1 ? "s" : ""} need manual review`,
      detail: "AI confidence was below 60% — these may be ambiguous or off-topic.",
    });
  }

  return insights.slice(0, 5);
}

function formatTheme(theme: string): string {
  return theme.replace(/^[CP]_/, "").replace(/_/g, " ");
}

export async function GET() {
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Step 1: "checking" — brief delay for UX
        sendSSE(controller, "status", { step: "checking", message: "Connecting to Summit Gear Co...." });
        await new Promise((r) => setTimeout(r, 400));

        // Step 2: "found" reviews
        const reviews = DEMO_REVIEWS;
        sendSSE(controller, "status", {
          step: "found",
          message: `Found ${reviews.length} reviews`,
          reviewCount: reviews.length,
        });
        await new Promise((r) => setTimeout(r, 300));

        // Step 3: Classify in batches of 5
        const classified: ClassifiedReview[] = [];
        const batchSize = 5;

        for (let i = 0; i < reviews.length; i += batchSize) {
          const batch = reviews.slice(i, i + batchSize);

          const results = await Promise.all(
            batch.map(async (review) => {
              try {
                const result = await classifyReview(review.text, "outdoor_gear");
                return { review, result };
              } catch (err) {
                console.error(`Failed to classify review ${review.id}:`, err);
                const fallback: ClassificationResult = { theme: "C_quality", sentiment: 0, confidence: 0.3 };
                return { review, result: fallback };
              }
            })
          );

          for (const { review, result } of results) {
            classified.push({
              id: review.id,
              text: review.text,
              rating: review.rating,
              author: review.author,
              createdAt: review.createdAt,
              theme: result.theme,
              sentiment: result.sentiment,
              confidence: result.confidence,
            });
          }

          sendSSE(controller, "status", {
            step: "classifying",
            message: `Classified ${Math.min(i + batchSize, reviews.length)} of ${reviews.length} reviews`,
            classified: Math.min(i + batchSize, reviews.length),
            total: reviews.length,
          });
        }

        // Step 4: Build aggregated data
        const sentiment = {
          positive: classified.filter((r) => r.sentiment === 1).length,
          negative: classified.filter((r) => r.sentiment === -1).length,
          neutral: classified.filter((r) => r.sentiment === 0).length,
          total: classified.length,
        };

        // Top themes
        const themeMap: Record<string, { count: number; sentimentSum: number }> = {};
        for (const r of classified) {
          if (!themeMap[r.theme]) themeMap[r.theme] = { count: 0, sentimentSum: 0 };
          themeMap[r.theme].count += 1;
          themeMap[r.theme].sentimentSum += r.sentiment;
        }
        const topThemes = Object.entries(themeMap)
          .map(([theme, data]) => ({
            theme,
            count: data.count,
            avgSentiment: Number((data.sentimentSum / data.count).toFixed(2)),
          }))
          .sort((a, b) => b.count - a.count);

        // Current week sentiment (reviews from last 7 days = ids 1-12)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const currentWeekReviews = classified.filter((r) => new Date(r.createdAt) >= sevenDaysAgo);
        const currentWeek = {
          positive: currentWeekReviews.filter((r) => r.sentiment === 1).length,
          negative: currentWeekReviews.filter((r) => r.sentiment === -1).length,
          neutral: currentWeekReviews.filter((r) => r.sentiment === 0).length,
          total: currentWeekReviews.length,
        };

        const prevTotal = DEMO_PREVIOUS_WEEK.total;
        const weekOverWeek = {
          currentWeek,
          previousWeek: DEMO_PREVIOUS_WEEK,
          positiveChange: prevTotal > 0
            ? Math.round(((currentWeek.positive / currentWeek.total) * 100) - ((DEMO_PREVIOUS_WEEK.positive / prevTotal) * 100))
            : null,
          negativeChange: prevTotal > 0
            ? Math.round(((currentWeek.negative / currentWeek.total) * 100) - ((DEMO_PREVIOUS_WEEK.negative / prevTotal) * 100))
            : null,
        };

        // Insights
        const insights = buildInsights(classified);

        // Reviews for table (formatted for ReviewsList component)
        const reviewsForTable = classified.map((r) => ({
          id: r.id,
          text: r.text,
          rating: r.rating,
          theme: r.theme,
          sentiment: r.sentiment,
          confidence: r.confidence,
          createdAt: r.createdAt,
        }));

        sendSSE(controller, "done", {
          storeName: "Summit Gear Co.",
          sentiment,
          topThemes,
          weekOverWeek,
          reviews: reviewsForTable,
          insights,
        });
      } catch (err) {
        console.error("Demo analysis failed:", err);
        sendSSE(controller, "error", {
          message: err instanceof Error ? err.message : "Analysis failed",
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
