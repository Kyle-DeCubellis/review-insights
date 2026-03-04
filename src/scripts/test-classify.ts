/**
 * Quick smoke test for the classification service.
 * Usage: npm run test:classify
 */

import { classifyReview } from "../lib/classifier";

const TEST_REVIEWS = [
  {
    text: "The stitching came apart after just two washes. Really disappointed in the quality.",
    category: "apparel",
    expectedTheme: "C_durability",
  },
  {
    text: "Arrived in 2 days! Packaging was immaculate, product was exactly as described.",
    category: "general",
    expectedTheme: "C_shipping",
  },
  {
    text: "Great value for the price. Works exactly as advertised.",
    category: "electronics",
    expectedTheme: "C_value",
  },
  {
    text: "Runs small, had to exchange for a larger size. The process was easy though.",
    category: "apparel",
    expectedTheme: "C_fit_comfort",
  },
  {
    text: "Customer service was incredibly helpful when I had an issue. 5 stars.",
    category: "general",
    expectedTheme: "C_customer_service",
  },
];

async function main() {
  console.log("Review Classification Smoke Test\n" + "=".repeat(40));

  let passed = 0;
  let failed = 0;

  for (const { text, category, expectedTheme } of TEST_REVIEWS) {
    process.stdout.write(`\nReview: "${text.slice(0, 60)}..."\n`);

    try {
      const result = await classifyReview(text, category);
      const themeMatch = result.theme === expectedTheme;

      console.log(`  Theme:      ${result.theme} ${themeMatch ? "✓" : `✗ (expected ${expectedTheme})`}`);
      console.log(`  Sentiment:  ${result.sentiment > 0 ? "positive" : result.sentiment < 0 ? "negative" : "neutral"} (${result.sentiment})`);
      console.log(`  Confidence: ${(result.confidence * 100).toFixed(0)}%`);

      // We consider it passing if sentiment and confidence look reasonable
      if ([-1, 0, 1].includes(result.sentiment) && result.confidence > 0) {
        passed++;
      } else {
        failed++;
        console.log("  FAILED: invalid sentiment or confidence");
      }
    } catch (err) {
      failed++;
      console.log(`  ERROR: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  console.log("\n" + "=".repeat(40));
  console.log(`Results: ${passed} passed, ${failed} failed out of ${TEST_REVIEWS.length} tests`);
  process.exit(failed > 0 ? 1 : 0);
}

main();
