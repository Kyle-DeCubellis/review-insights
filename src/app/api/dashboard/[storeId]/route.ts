import { NextRequest, NextResponse } from "next/server";
import { eq, and, gte, desc, sql, lt } from "drizzle-orm";
import { db } from "@/db";
import { stores, reviews, classifications } from "@/db/schema";

export interface DashboardResponse {
  storeId: number;
  shopifyStoreId: string;
  period: {
    from: string;
    to: string;
  };
  sentiment: {
    positive: number;
    negative: number;
    neutral: number;
    total: number;
  };
  topThemes: {
    theme: string;
    count: number;
    avgSentiment: number;
  }[];
  recentReviews: {
    id: number;
    text: string;
    rating: number;
    theme: string | null;
    sentiment: number | null;
    confidence: number | null;
    createdAt: string;
  }[];
  weekOverWeek: {
    currentWeek: { positive: number; negative: number; neutral: number; total: number };
    previousWeek: { positive: number; negative: number; neutral: number; total: number };
    positiveChange: number | null;
    negativeChange: number | null;
  } | null;
}

function sentimentCounts(rows: { sentiment: number; count: number }[]) {
  let positive = 0, negative = 0, neutral = 0;
  for (const r of rows) {
    if (r.sentiment === 1) positive = r.count;
    else if (r.sentiment === -1) negative = r.count;
    else neutral = r.count;
  }
  return { positive, negative, neutral, total: positive + negative + neutral };
}

export async function GET(
  request: NextRequest,
  { params }: { params: { storeId: string } }
) {
  const storeIdParam = params.storeId;

  // Support both numeric ID and shopify store domain
  const store = await (async () => {
    const numericId = parseInt(storeIdParam, 10);
    if (!isNaN(numericId)) {
      const [s] = await db.select().from(stores).where(eq(stores.id, numericId)).limit(1);
      return s;
    }
    const [s] = await db
      .select()
      .from(stores)
      .where(eq(stores.shopifyStoreId, storeIdParam))
      .limit(1);
    return s;
  })();

  if (!store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  const now = new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  // ─── Sentiment breakdown (last 24h) ────────────────────────────────────────
  const sentimentRows = await db
    .select({
      sentiment: classifications.sentiment,
      count: sql<number>`count(*)::int`,
    })
    .from(classifications)
    .innerJoin(reviews, eq(classifications.reviewId, reviews.id))
    .where(
      and(
        eq(classifications.storeId, store.id),
        gte(reviews.createdAt, twentyFourHoursAgo)
      )
    )
    .groupBy(classifications.sentiment);

  const sentiment = sentimentCounts(sentimentRows);

  // ─── Top themes (last 24h) ──────────────────────────────────────────────────
  const themeRows = await db
    .select({
      theme: classifications.classifiedTheme,
      count: sql<number>`count(*)::int`,
      avgSentiment: sql<number>`avg(${classifications.sentiment})::float`,
    })
    .from(classifications)
    .innerJoin(reviews, eq(classifications.reviewId, reviews.id))
    .where(
      and(
        eq(classifications.storeId, store.id),
        gte(reviews.createdAt, twentyFourHoursAgo)
      )
    )
    .groupBy(classifications.classifiedTheme)
    .orderBy(desc(sql`count(*)`))
    .limit(10);

  const topThemes = themeRows.map((r) => ({
    theme: r.theme,
    count: r.count,
    avgSentiment: Math.round((r.avgSentiment ?? 0) * 100) / 100,
  }));

  // ─── Recent reviews (last 24h) ──────────────────────────────────────────────
  const recentRows = await db
    .select({
      id: reviews.id,
      text: reviews.reviewText,
      rating: reviews.rating,
      theme: classifications.classifiedTheme,
      sentiment: classifications.sentiment,
      confidence: classifications.confidence,
      createdAt: reviews.createdAt,
    })
    .from(reviews)
    .leftJoin(classifications, eq(reviews.id, classifications.reviewId))
    .where(
      and(
        eq(reviews.storeId, store.id),
        gte(reviews.createdAt, twentyFourHoursAgo)
      )
    )
    .orderBy(desc(reviews.createdAt))
    .limit(50);

  const recentReviews = recentRows.map((r) => ({
    id: r.id,
    text: r.text,
    rating: r.rating,
    theme: r.theme ?? null,
    sentiment: r.sentiment ?? null,
    confidence: r.confidence ?? null,
    createdAt: r.createdAt.toISOString(),
  }));

  // ─── Week-over-week comparison ──────────────────────────────────────────────
  let weekOverWeek: DashboardResponse["weekOverWeek"] = null;

  const [currentWeekRows, previousWeekRows] = await Promise.all([
    db
      .select({
        sentiment: classifications.sentiment,
        count: sql<number>`count(*)::int`,
      })
      .from(classifications)
      .innerJoin(reviews, eq(classifications.reviewId, reviews.id))
      .where(
        and(eq(classifications.storeId, store.id), gte(reviews.createdAt, sevenDaysAgo))
      )
      .groupBy(classifications.sentiment),

    db
      .select({
        sentiment: classifications.sentiment,
        count: sql<number>`count(*)::int`,
      })
      .from(classifications)
      .innerJoin(reviews, eq(classifications.reviewId, reviews.id))
      .where(
        and(
          eq(classifications.storeId, store.id),
          gte(reviews.createdAt, fourteenDaysAgo),
          lt(reviews.createdAt, sevenDaysAgo)
        )
      )
      .groupBy(classifications.sentiment),
  ]);

  const currentWeek = sentimentCounts(currentWeekRows);
  const previousWeek = sentimentCounts(previousWeekRows);

  if (previousWeek.total > 0 || currentWeek.total > 0) {
    const pctChange = (curr: number, prev: number) => {
      if (prev === 0) return null;
      return Math.round(((curr - prev) / prev) * 100);
    };

    weekOverWeek = {
      currentWeek,
      previousWeek,
      positiveChange: pctChange(currentWeek.positive, previousWeek.positive),
      negativeChange: pctChange(currentWeek.negative, previousWeek.negative),
    };
  }

  const response: DashboardResponse = {
    storeId: store.id,
    shopifyStoreId: store.shopifyStoreId,
    period: {
      from: twentyFourHoursAgo.toISOString(),
      to: now.toISOString(),
    },
    sentiment,
    topThemes,
    recentReviews,
    weekOverWeek,
  };

  return NextResponse.json(response);
}
