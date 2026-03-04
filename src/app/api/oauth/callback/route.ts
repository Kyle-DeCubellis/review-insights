import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { stores } from "@/db/schema";
import { exchangeCodeForToken } from "@/lib/judge-me-client";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const shop = searchParams.get("shop");
  const state = searchParams.get("state");

  // Validate required params
  if (!code || !shop) {
    return NextResponse.json(
      { error: "Missing code or shop parameter" },
      { status: 400 }
    );
  }

  // Validate CSRF state
  const storedState = request.cookies.get("oauth_state")?.value;
  if (!storedState || storedState !== state) {
    return NextResponse.json({ error: "Invalid state parameter" }, { status: 400 });
  }

  const clientId = process.env.JUDGEME_CLIENT_ID;
  const clientSecret = process.env.JUDGEME_CLIENT_SECRET;
  const redirectUri = process.env.JUDGEME_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    return NextResponse.json(
      { error: "OAuth not configured on server" },
      { status: 500 }
    );
  }

  try {
    // Exchange code for API token
    const tokenData = await exchangeCodeForToken(code, clientId, clientSecret, redirectUri);

    // Upsert store record
    const [existingStore] = await db
      .select()
      .from(stores)
      .where(eq(stores.shopifyStoreId, shop))
      .limit(1);

    let storeId: number;

    if (existingStore) {
      await db
        .update(stores)
        .set({
          judgeMeApiToken: tokenData.access_token,
          status: "active",
        })
        .where(eq(stores.id, existingStore.id));
      storeId = existingStore.id;
    } else {
      const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14-day trial
      const [newStore] = await db
        .insert(stores)
        .values({
          shopifyStoreId: shop,
          judgeMeApiToken: tokenData.access_token,
          productCategory: "general",
          tier: "trial",
          trialEndsAt,
          status: "active",
        })
        .returning();
      storeId = newStore.id;
    }

    // Clear the OAuth state cookie
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
    const response = NextResponse.redirect(
      `${appUrl}/onboarding?storeId=${storeId}`
    );
    response.cookies.delete("oauth_state");
    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[oauth/callback] error:", message);
    return NextResponse.json({ error: "OAuth flow failed", detail: message }, { status: 500 });
  }
}
