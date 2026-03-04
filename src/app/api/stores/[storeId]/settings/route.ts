import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { stores } from "@/db/schema";

// PATCH /api/stores/[storeId]/settings — update product category + Slack webhook
export async function PATCH(
  request: NextRequest,
  { params }: { params: { storeId: string } }
) {
  const storeId = parseInt(params.storeId, 10);
  if (isNaN(storeId)) {
    return NextResponse.json({ error: "Invalid storeId" }, { status: 400 });
  }

  const body = (await request.json()) as {
    productCategory?: string;
    slackWebhookUrl?: string;
  };

  const updates: Partial<typeof stores.$inferInsert> = {};
  if (body.productCategory) updates.productCategory = body.productCategory;
  if (typeof body.slackWebhookUrl === "string") {
    updates.slackWebhookUrl = body.slackWebhookUrl || null;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const [updated] = await db
    .update(stores)
    .set(updates)
    .where(eq(stores.id, storeId))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, store: updated });
}
