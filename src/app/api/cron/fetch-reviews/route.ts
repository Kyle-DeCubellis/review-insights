import { NextRequest, NextResponse } from "next/server";
import { eq, desc } from "drizzle-orm";
import { db } from "@/db";
import { stores, reviews } from "@/db/schema";
import { fetchAllReviews } from "@/lib/judge-me-client";
import { verifyCronSecret } from "@/lib/auth";

export const maxDuration = 60; // Vercel max for hobby plan

export async function GET(request: NextRequest) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results: {
    storeId: number;
    shopifyStoreId: string;
    fetched: number;
    inserted: number;
    errors: string[];
  }[] = [];

  try {
    // Fetch all active stores that have a Judge.me API token
    const activeStores = await db
      .select()
      .from(stores)
      .where(eq(stores.status, "active"));

    const storesWithToken = activeStores.filter((s) => s.judgeMeApiToken);

    for (const store of storesWithToken) {
      const storeResult = {
        storeId: store.id,
        shopifyStoreId: store.shopifyStoreId,
        fetched: 0,
        inserted: 0,
        errors: [] as string[],
      };

      try {
        // Find the most recent review we have for this store
        const [latestReview] = await db
          .select({ createdAt: reviews.createdAt })
          .from(reviews)
          .where(eq(reviews.storeId, store.id))
          .orderBy(desc(reviews.createdAt))
          .limit(1);

        // Fetch reviews since the last one we have (or last 7 days if none)
        const since = latestReview
          ? latestReview.createdAt
          : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        for await (const batch of fetchAllReviews({
          apiToken: store.judgeMeApiToken!,
          shopDomain: store.shopifyStoreId,
          since,
        })) {
          storeResult.fetched += batch.length;

          // Upsert reviews (ignore duplicates)
          for (const review of batch) {
            if (!review.body?.trim()) continue; // skip empty reviews

            try {
              await db
                .insert(reviews)
                .values({
                  storeId: store.id,
                  judgeMeReviewId: String(review.id),
                  reviewText: review.body.trim(),
                  rating: review.rating,
                  productSku: review.product_external_id ?? null,
                  source: "judge_me",
                  createdAt: new Date(review.created_at),
                })
                .onConflictDoNothing();

              storeResult.inserted++;
            } catch (err) {
              const msg = err instanceof Error ? err.message : String(err);
              storeResult.errors.push(`Review ${review.id}: ${msg}`);
            }
          }
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`Error fetching reviews for store ${store.id}:`, msg);
        storeResult.errors.push(msg);
      }

      results.push(storeResult);
    }

    console.log("[fetch-reviews] completed", JSON.stringify(results));
    return NextResponse.json({ ok: true, results });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[fetch-reviews] fatal error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
