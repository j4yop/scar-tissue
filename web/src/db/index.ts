import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

type DrizzleDb = ReturnType<typeof drizzle<typeof schema>>;

let _db: DrizzleDb | null = null;

function init(): DrizzleDb {
  if (!_db) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString || connectionString.startsWith("placeholder")) {
      throw new Error(
        "DATABASE_URL is not set or is a placeholder. Provision Postgres (`vercel integration add neon`) and pull env."
      );
    }
    const client = postgres(connectionString, {
      max: 5,
      idle_timeout: 20,
      connect_timeout: 10,
      prepare: false, // required for pooled/serverless Postgres (Neon/Supabase poolers)
    });
    _db = drizzle(client, { schema });
  }
  return _db;
}

/**
 * Lazy proxy so importing this module never throws at build time —
 * the connection is created on first real query.
 */
export const db = new Proxy({} as DrizzleDb, {
  get(_target, prop, receiver) {
    return Reflect.get(init(), prop, receiver);
  },
});

export { schema };
