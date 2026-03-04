import {
  pgTable,
  serial,
  text,
  integer,
  real,
  timestamp,
  boolean,
  pgEnum,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const tierEnum = pgEnum("tier", ["trial", "starter", "pro", "enterprise"]);
export const storeStatusEnum = pgEnum("store_status", ["active", "inactive", "suspended"]);
export const sentimentEnum = pgEnum("sentiment_label", ["positive", "negative", "neutral"]);

// ─── stores ───────────────────────────────────────────────────────────────────

export const stores = pgTable("stores", {
  id: serial("id").primaryKey(),
  shopifyStoreId: text("shopify_store_id").notNull().unique(),
  judgeMeApiToken: text("judge_me_api_token"),
  productCategory: text("product_category").notNull().default("general"),
  slackWebhookUrl: text("slack_webhook_url"),
  tier: tierEnum("tier").notNull().default("trial"),
  trialEndsAt: timestamp("trial_ends_at"),
  status: storeStatusEnum("status").notNull().default("active"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── reviews ──────────────────────────────────────────────────────────────────

export const reviews = pgTable(
  "reviews",
  {
    id: serial("id").primaryKey(),
    storeId: integer("store_id")
      .notNull()
      .references(() => stores.id, { onDelete: "cascade" }),
    judgeMeReviewId: text("judge_me_review_id").notNull(),
    reviewText: text("review_text").notNull(),
    rating: integer("rating").notNull(), // 1-5
    productSku: text("product_sku"),
    source: text("source").notNull().default("judge_me"),
    createdAt: timestamp("created_at").notNull(),
    fetchedAt: timestamp("fetched_at").notNull().defaultNow(),
  },
  (table) => ({
    storeJudgeMeIdx: uniqueIndex("reviews_store_judgeme_idx").on(
      table.storeId,
      table.judgeMeReviewId
    ),
    storeCreatedIdx: index("reviews_store_created_idx").on(table.storeId, table.createdAt),
  })
);

// ─── classifications ──────────────────────────────────────────────────────────

export const classifications = pgTable(
  "classifications",
  {
    id: serial("id").primaryKey(),
    reviewId: integer("review_id")
      .notNull()
      .unique()
      .references(() => reviews.id, { onDelete: "cascade" }),
    storeId: integer("store_id")
      .notNull()
      .references(() => stores.id, { onDelete: "cascade" }),
    classifiedTheme: text("classified_theme").notNull(),
    sentiment: integer("sentiment").notNull(), // -1, 0, 1
    confidence: real("confidence").notNull(), // 0-1
    classifiedAt: timestamp("classified_at").notNull().defaultNow(),
    claudeModel: text("claude_model").notNull(),
  },
  (table) => ({
    storeThemeIdx: index("classifications_store_theme_idx").on(
      table.storeId,
      table.classifiedTheme
    ),
    storeSentimentIdx: index("classifications_store_sentiment_idx").on(
      table.storeId,
      table.sentiment
    ),
  })
);

// ─── digests ──────────────────────────────────────────────────────────────────

export const digests = pgTable(
  "digests",
  {
    id: serial("id").primaryKey(),
    storeId: integer("store_id")
      .notNull()
      .references(() => stores.id, { onDelete: "cascade" }),
    digestDate: timestamp("digest_date").notNull(),
    sentimentPositive: integer("sentiment_positive").notNull().default(0),
    sentimentNegative: integer("sentiment_negative").notNull().default(0),
    sentimentNeutral: integer("sentiment_neutral").notNull().default(0),
    topThemes: text("top_themes"), // JSON string of [{theme, count}]
    sentAt: timestamp("sent_at"),
    slackMessageTs: text("slack_message_ts"), // Slack message timestamp for threading
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    storeDateIdx: uniqueIndex("digests_store_date_idx").on(table.storeId, table.digestDate),
  })
);

// ─── Relations ────────────────────────────────────────────────────────────────

export const storesRelations = relations(stores, ({ many }) => ({
  reviews: many(reviews),
  classifications: many(classifications),
  digests: many(digests),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  store: one(stores, { fields: [reviews.storeId], references: [stores.id] }),
  classification: one(classifications, {
    fields: [reviews.id],
    references: [classifications.reviewId],
  }),
}));

export const classificationsRelations = relations(classifications, ({ one }) => ({
  review: one(reviews, { fields: [classifications.reviewId], references: [reviews.id] }),
  store: one(stores, { fields: [classifications.storeId], references: [stores.id] }),
}));

export const digestsRelations = relations(digests, ({ one }) => ({
  store: one(stores, { fields: [digests.storeId], references: [stores.id] }),
}));

// ─── Types ────────────────────────────────────────────────────────────────────

export type Store = typeof stores.$inferSelect;
export type NewStore = typeof stores.$inferInsert;
export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;
export type Classification = typeof classifications.$inferSelect;
export type NewClassification = typeof classifications.$inferInsert;
export type Digest = typeof digests.$inferSelect;
export type NewDigest = typeof digests.$inferInsert;
