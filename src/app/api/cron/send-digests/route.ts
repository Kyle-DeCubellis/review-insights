import { NextRequest, NextResponse } from "next/server";
import { eq, and, gte, sql, desc } from "drizzle-orm";
import { db } from "@/db";
import { stores, reviews, classifications, digests } from "@/db/schema";
import { verifyCronSecret } from "@/lib/auth";

export const maxDuration = 60;

interface ThemeCount {
  theme: string;
  count: number;
}

interface DigestData {
  storeId: number;
  positive: number;
  negative: number;
  neutral: number;
  topThemes: ThemeCount[];
  total: number;
}

async function buildDigest(store: { id: number }, since: Date): Promise<DigestData> {
  // Aggregate sentiment counts for this store in the time window
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
        gte(reviews.createdAt, since)
      )
    )
    .groupBy(classifications.sentiment);

  let positive = 0, negative = 0, neutral = 0;
  for (const row of sentimentRows) {
    if (row.sentiment === 1) positive = row.count;
    else if (row.sentiment === -1) negative = row.count;
    else neutral = row.count;
  }

  // Top themes
  const themeRows = await db
    .select({
      theme: classifications.classifiedTheme,
      count: sql<number>`count(*)::int`,
    })
    .from(classifications)
    .innerJoin(reviews, eq(classifications.reviewId, reviews.id))
    .where(
      and(
        eq(classifications.storeId, store.id),
        gte(reviews.createdAt, since)
      )
    )
    .groupBy(classifications.classifiedTheme)
    .orderBy(desc(sql`count(*)`))
    .limit(5);

  return {
    storeId: store.id,
    positive,
    negative,
    neutral,
    topThemes: themeRows.map((r) => ({ theme: r.theme, count: r.count })),
    total: positive + negative + neutral,
  };
}

async function sendSlackDigest(
  webhookUrl: string,
  digest: DigestData,
  storeName: string
): Promise<void> {
  const total = digest.total;
  if (total === 0) return;

  const posPercent = total > 0 ? Math.round((digest.positive / total) * 100) : 0;
  const negPercent = total > 0 ? Math.round((digest.negative / total) * 100) : 0;
  const neuPercent = 100 - posPercent - negPercent;

  const topThemesText = digest.topThemes
    .slice(0, 3)
    .map((t, i) => `${i + 1}. \`${t.theme}\` — ${t.count} mentions`)
    .join("\n");

  const payload = {
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: `📊 Daily Review Digest — ${storeName}`,
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*${total} reviews* in the last 24 hours\n\n*Sentiment:*\n✅ Positive: ${digest.positive} (${posPercent}%)\n❌ Negative: ${digest.negative} (${negPercent}%)\n➖ Neutral: ${digest.neutral} (${neuPercent}%)`,
        },
      },
      ...(topThemesText
        ? [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: `*Top Themes:*\n${topThemesText}`,
              },
            },
          ]
        : []),
      {
        type: "divider",
      },
    ],
  };

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Slack webhook failed: ${response.status} ${response.statusText}`);
  }
}

export async function GET(request: NextRequest) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results: {
    storeId: number;
    total: number;
    sent: boolean;
    error?: string;
  }[] = [];

  try {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const digestDate = new Date();
    digestDate.setHours(0, 0, 0, 0);

    const activeStores = await db
      .select()
      .from(stores)
      .where(eq(stores.status, "active"));

    for (const store of activeStores) {
      const storeResult = { storeId: store.id, total: 0, sent: false };

      try {
        const digest = await buildDigest(store, since);
        storeResult.total = digest.total;

        if (digest.total === 0) {
          results.push(storeResult);
          continue;
        }

        // Upsert digest record
        const [savedDigest] = await db
          .insert(digests)
          .values({
            storeId: store.id,
            digestDate,
            sentimentPositive: digest.positive,
            sentimentNegative: digest.negative,
            sentimentNeutral: digest.neutral,
            topThemes: JSON.stringify(digest.topThemes),
          })
          .onConflictDoNothing()
          .returning();

        // Send to Slack if webhook is configured
        if (store.slackWebhookUrl && savedDigest) {
          try {
            await sendSlackDigest(store.slackWebhookUrl, digest, store.shopifyStoreId);

            await db
              .update(digests)
              .set({ sentAt: new Date() })
              .where(eq(digests.id, savedDigest.id));

            storeResult.sent = true;
          } catch (slackErr) {
            const msg = slackErr instanceof Error ? slackErr.message : String(slackErr);
            console.error(`Slack send failed for store ${store.id}:`, msg);
            (storeResult as typeof storeResult & { error?: string }).error = msg;
          }
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`Digest error for store ${store.id}:`, msg);
        (storeResult as typeof storeResult & { error?: string }).error = msg;
      }

      results.push(storeResult);
    }

    console.log("[send-digests] completed", JSON.stringify(results));
    return NextResponse.json({ ok: true, results });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[send-digests] fatal error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
