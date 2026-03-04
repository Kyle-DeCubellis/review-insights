// Judge.me API client
// Docs: https://judge.me/api/docs

const JUDGEME_BASE_URL = "https://judge.me/api/v1";

export interface JudgeMeReview {
  id: number;
  title: string | null;
  body: string;
  rating: number; // 1-5
  reviewer: {
    id: number;
    name: string;
    email?: string;
  };
  product_handle: string | null;
  product_id: number | null;
  created_at: string; // ISO 8601
  hidden: boolean;
  verified: boolean;
  source: string;
  product_external_id: string | null;
  curated: boolean;
}

export interface JudgeMeReviewsResponse {
  reviews: JudgeMeReview[];
  current_page: number;
  per_page: number;
  total_pages: number;
  total_count: number;
}

export interface FetchReviewsOptions {
  /** API token from judge.me */
  apiToken: string;
  /** Shopify store domain, e.g. "mystore.myshopify.com" */
  shopDomain: string;
  /** Fetch reviews created after this date */
  since?: Date;
  /** Page number (1-indexed) */
  page?: number;
  /** Reviews per page (max 100) */
  perPage?: number;
}

// ─── Core fetch function ──────────────────────────────────────────────────────

async function fetchReviewsPage(
  options: FetchReviewsOptions
): Promise<JudgeMeReviewsResponse> {
  const { apiToken, shopDomain, since, page = 1, perPage = 100 } = options;

  const params = new URLSearchParams({
    api_token: apiToken,
    shop_domain: shopDomain,
    page: String(page),
    per_page: String(Math.min(perPage, 100)),
  });

  if (since) {
    // Judge.me accepts ISO 8601 date strings for filtering
    params.set("since_id", "0");
    params.set("created_at_min", since.toISOString());
  }

  const url = `${JUDGEME_BASE_URL}/reviews?${params.toString()}`;

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    // 30 second timeout
    signal: AbortSignal.timeout(30_000),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `Judge.me API error ${response.status}: ${response.statusText}. Body: ${body}`
    );
  }

  return response.json() as Promise<JudgeMeReviewsResponse>;
}

// ─── Paginated fetch ──────────────────────────────────────────────────────────

/**
 * Fetch all reviews since a given date, automatically paginating through results.
 * Returns an async generator that yields reviews in batches.
 */
export async function* fetchAllReviews(
  options: Omit<FetchReviewsOptions, "page">
): AsyncGenerator<JudgeMeReview[], void, unknown> {
  let page = 1;

  while (true) {
    const data = await fetchReviewsPage({ ...options, page });

    if (data.reviews.length === 0) break;

    // Filter out hidden reviews
    const visible = data.reviews.filter((r) => !r.hidden);
    if (visible.length > 0) {
      yield visible;
    }

    if (page >= data.total_pages) break;
    page++;

    // Small delay between pages
    await new Promise((r) => setTimeout(r, 100));
  }
}

/**
 * Collect all reviews into a single array (use for small result sets).
 */
export async function collectAllReviews(
  options: Omit<FetchReviewsOptions, "page">
): Promise<JudgeMeReview[]> {
  const all: JudgeMeReview[] = [];
  for await (const batch of fetchAllReviews(options)) {
    all.push(...batch);
  }
  return all;
}

// ─── OAuth helpers ────────────────────────────────────────────────────────────

export interface OAuthTokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
}

/**
 * Exchange an authorization code for an API token via Judge.me OAuth.
 */
export async function exchangeCodeForToken(
  code: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string
): Promise<OAuthTokenResponse> {
  const response = await fetch(`${JUDGEME_BASE_URL}/oauth/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `Judge.me token exchange failed ${response.status}: ${body}`
    );
  }

  return response.json() as Promise<OAuthTokenResponse>;
}

/**
 * Build the authorization URL to redirect users to for Judge.me OAuth.
 */
export function buildAuthorizationUrl(
  clientId: string,
  redirectUri: string,
  shopDomain: string,
  state: string
): string {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    shop: shopDomain,
    state,
  });
  return `https://judge.me/oauth/authorize?${params.toString()}`;
}
