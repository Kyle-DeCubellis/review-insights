import { NextRequest } from "next/server";

/**
 * Verify that a cron request is authorized via the CRON_SECRET header.
 * In production this matches the secret Vercel sends in the Authorization header.
 */
export function verifyCronSecret(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    // If no secret is configured, only allow in development
    return process.env.NODE_ENV === "development";
  }

  const authHeader = request.headers.get("authorization");
  return authHeader === `Bearer ${secret}`;
}
