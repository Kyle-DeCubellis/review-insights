import { NextRequest, NextResponse } from "next/server";
import { buildAuthorizationUrl } from "@/lib/judge-me-client";
import crypto from "crypto";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const shopDomain = searchParams.get("shop");

  if (!shopDomain) {
    return NextResponse.json({ error: "Missing shop parameter" }, { status: 400 });
  }

  const clientId = process.env.JUDGEME_CLIENT_ID;
  const redirectUri = process.env.JUDGEME_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return NextResponse.json(
      { error: "OAuth not configured. Set JUDGEME_CLIENT_ID and JUDGEME_REDIRECT_URI." },
      { status: 500 }
    );
  }

  // Generate a random state token to prevent CSRF
  const state = crypto.randomBytes(16).toString("hex");

  // In production, store state in a short-lived session/cookie
  const authUrl = buildAuthorizationUrl(clientId, redirectUri, shopDomain, state);

  const response = NextResponse.redirect(authUrl);

  // Store state in a cookie for verification in the callback
  response.cookies.set("oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 10, // 10 minutes
    path: "/",
  });

  return response;
}
