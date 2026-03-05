import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Prevent multiple connections in development (Next.js hot reload)
declare global {
  // eslint-disable-next-line no-var
  var _pgClient: postgres.Sql | undefined;
}

function createClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  return postgres(connectionString, {
    max: 10,
    idle_timeout: 30,
    connect_timeout: 10,
  });
}

function getDb() {
  const client = globalThis._pgClient ?? createClient();
  if (process.env.NODE_ENV !== "production") {
    globalThis._pgClient = client;
  }
  return drizzle(client, { schema });
}

// Lazy proxy: only connects to DB when a property is actually accessed.
// This prevents build failures when DATABASE_URL isn't set (e.g., demo route
// transitively imports this file but never queries the DB).
export const db = new Proxy({} as ReturnType<typeof getDb>, {
  get(_target, prop, receiver) {
    const real = getDb();
    return Reflect.get(real, prop, receiver);
  },
});

export type DB = ReturnType<typeof getDb>;
