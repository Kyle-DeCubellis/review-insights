import Anthropic from "@anthropic-ai/sdk";

// ─── Theme Taxonomy ───────────────────────────────────────────────────────────

export const THEMES = [
  // Core product themes (C_ prefix)
  "C_quality",
  "C_durability",
  "C_fit_comfort",
  "C_performance",
  "C_design",
  "C_shipping",
  "C_packaging",
  "C_customer_service",
  "C_value",
  // Product-specific themes (P_ prefix)
  "P_quality",
  "P_design",
  "P_value",
  "P_customer_service",
  "P_performance",
  "P_comfort",
  "P_shipping",
  "P_packaging",
  "P_sizing",
  "P_material",
  "P_durability",
  "P_ease_of_use",
  "P_instructions",
  "P_appearance",
] as const;

export type Theme = (typeof THEMES)[number];

export interface ClassificationResult {
  theme: Theme;
  sentiment: -1 | 0 | 1;
  confidence: number; // 0-1
}

// ─── Classifier ───────────────────────────────────────────────────────────────

const client = new Anthropic();

const MODEL = "claude-sonnet-4-6";

const SYSTEM_PROMPT = `You are a product review classifier. Your job is to analyze customer reviews and extract:
1. The primary theme (what the review is mainly about)
2. The sentiment (-1=negative, 0=neutral, 1=positive)
3. Your confidence in this classification (0.0-1.0)

Available themes:
${THEMES.join(", ")}

Theme guide:
- C_quality: Overall build quality, materials, craftsmanship
- C_durability: How long-lasting or robust the product is
- C_fit_comfort: Size, fit, feel, ergonomics
- C_performance: How well the product works/functions
- C_design: Aesthetics, look, style
- C_shipping: Delivery speed, packaging damage in transit
- C_packaging: Unboxing experience, box quality
- C_customer_service: Support, returns, communication
- C_value: Price-to-quality ratio, worth the money
- P_* variants: Same concepts but product-category specific

Rules:
- Pick the single most prominent theme
- If the review covers multiple topics, pick the dominant one
- Short reviews (under 10 words) get lower confidence
- Always return valid JSON

Return ONLY a JSON object with this exact shape:
{"theme": "C_quality", "sentiment": 1, "confidence": 0.92}`;

export async function classifyReview(
  reviewText: string,
  productCategory: string = "general"
): Promise<ClassificationResult> {
  const userMessage = `Product category: ${productCategory}

Review text:
"${reviewText}"

Classify this review.`;

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 128,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
  });

  const content = message.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type from Claude");
  }

  const raw = content.text.trim();

  // Extract JSON if wrapped in markdown code blocks
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error(`Failed to extract JSON from Claude response: ${raw}`);
  }

  const parsed = JSON.parse(jsonMatch[0]) as {
    theme: string;
    sentiment: number;
    confidence: number;
  };

  // Validate theme
  if (!THEMES.includes(parsed.theme as Theme)) {
    console.warn(`Unknown theme "${parsed.theme}", defaulting to C_quality`);
    parsed.theme = "C_quality";
  }

  // Validate sentiment
  const sentiment = parsed.sentiment as -1 | 0 | 1;
  if (![-1, 0, 1].includes(sentiment)) {
    throw new Error(`Invalid sentiment value: ${parsed.sentiment}`);
  }

  // Clamp confidence to [0, 1]
  const confidence = Math.max(0, Math.min(1, parsed.confidence ?? 0.5));

  return {
    theme: parsed.theme as Theme,
    sentiment,
    confidence,
  };
}

// ─── Batch classifier ─────────────────────────────────────────────────────────

export interface BatchItem {
  reviewId: number;
  reviewText: string;
  productCategory: string;
}

export interface BatchResult {
  reviewId: number;
  result: ClassificationResult | null;
  error?: string;
}

export async function classifyBatch(
  items: BatchItem[],
  concurrency = 5
): Promise<BatchResult[]> {
  const results: BatchResult[] = [];

  // Process in chunks to respect rate limits
  for (let i = 0; i < items.length; i += concurrency) {
    const chunk = items.slice(i, i + concurrency);
    const chunkResults = await Promise.all(
      chunk.map(async (item) => {
        try {
          const result = await classifyReview(item.reviewText, item.productCategory);
          return { reviewId: item.reviewId, result };
        } catch (err) {
          const error = err instanceof Error ? err.message : String(err);
          console.error(`Failed to classify review ${item.reviewId}: ${error}`);
          return { reviewId: item.reviewId, result: null, error };
        }
      })
    );
    results.push(...chunkResults);

    // Small delay between chunks to avoid rate limits
    if (i + concurrency < items.length) {
      await new Promise((r) => setTimeout(r, 200));
    }
  }

  return results;
}
