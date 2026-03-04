import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Prevent multiple connections in development (Next.js hot reload)
declare global {
  // eslint-disable-next-line no-var
  var _pgClient: postgres.Sql | undefined;
}

type DrizzleDB = ReturnType<typeof drizzle<typeof schema>>;

let _db: DrizzleDB | null = null;

/**
 * Lazily initialise the DB connection the first time a query is made.
 * This avoids the "DATABASE_URL not set" error during `next build`, when
 * Next.js imports every route module at build time but never actually runs
 * any queries.
 */
function getDb(): DrizzleDB {
  if (_db) return _db;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  const client =
    globalThis._pgClient ??
    postgres(connectionString, {
      max: 10,
      idle_timeout: 30,
      connect_timeout: 10,
    });

  if (process.env.NODE_ENV !== "production") {
    globalThis._pgClient = client;
  }

  _db = drizzle(client, { schema });
  return _db;
}

// Transparent proxy — all existing call sites (db.select(), db.insert(), …)
// work unchanged; the real connection is only created on first property access.
export const db = new Proxy({} as DrizzleDB, {
  get(_, prop) {
    return Reflect.get(getDb(), prop);
  },
});

export type DB = typeof db;
