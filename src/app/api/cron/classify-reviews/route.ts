import { NextRequest, NextResponse } from "next/server";
import { eq, isNull, sql } from "drizzle-orm";
import { db } from "@/db";
import { stores, reviews, classifications } from "@/db/schema";
import { classifyBatch, type BatchItem } from "@/lib/classifier";
import { verifyCronSecret } from "@/lib/auth";

export const maxDuration = 300; // 5 minutes for Pro plan

const BATCH_SIZE = 50; // reviews per run per store

export async function GET(request: NextRequest) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results: {
    storeId: number;
    classified: number;
    failed: number;
  }[] = [];

  try {
    const activeStores = await db
      .select()
      .from(stores)
      .where(eq(stores.status, "active"));

    for (const store of activeStores) {
      let classified = 0;
      let failed = 0;

      try {
        // Find reviews for this store that have no classification yet
        const unclassified = await db
          .select({
            id: reviews.id,
            reviewText: reviews.reviewText,
          })
          .from(reviews)
          .leftJoin(classifications, eq(reviews.id, classifications.reviewId))
          .where(
            sql`${reviews.storeId} = ${store.id} AND ${classifications.id} IS NULL`
          )
          .limit(BATCH_SIZE);

        if (unclassified.length === 0) continue;

        const batchItems: BatchItem[] = unclassified.map((r) => ({
          reviewId: r.id,
          reviewText: r.reviewText,
          productCategory: store.productCategory,
        }));

        const batchResults = await classifyBatch(batchItems, 5);

        for (const result of batchResults) {
          if (!result.result) {
            failed++;
            continue;
          }

          try {
            await db.insert(classifications).values({
              reviewId: result.reviewId,
              storeId: store.id,
              classifiedTheme: result.result.theme,
              sentiment: result.result.sentiment,
              confidence: result.result.confidence,
              claudeModel: "claude-sonnet-4-6",
            });
            classified++;
          } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            console.error(
              `Failed to insert classification for review ${result.reviewId}:`,
              msg
            );
            failed++;
          }
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`Error classifying reviews for store ${store.id}:`, msg);
      }

      results.push({ storeId: store.id, classified, failed });
    }

    console.log("[classify-reviews] completed", JSON.stringify(results));
    return NextResponse.json({ ok: true, results });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[classify-reviews] fatal error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
