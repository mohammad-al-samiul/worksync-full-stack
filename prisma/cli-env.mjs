/**
 * ESM helper for prisma/seed.mjs — same URL rules as prisma.config.ts
 */
import "dotenv/config";

const LOCAL_DEFAULT =
  "postgresql://postgres:postgres@127.0.0.1:5432/worksync?schema=public";

export function isSupabaseTransactionPooler(url) {
  return /:6543(\/|$|\?)/.test(url);
}

export function getAppDatabaseUrl() {
  const raw = process.env.DATABASE_URL?.trim() || LOCAL_DEFAULT;
  if (!isSupabaseTransactionPooler(raw)) return raw;
  try {
    const parsed = new URL(raw);
    if (!parsed.searchParams.has("pgbouncer")) {
      parsed.searchParams.set("pgbouncer", "true");
    }
    return parsed.toString();
  } catch {
    const sep = raw.includes("?") ? "&" : "?";
    return `${raw}${sep}pgbouncer=true`;
  }
}

export function getCliDatabaseUrl() {
  const direct = process.env.DIRECT_URL?.trim();
  if (direct) return direct;

  const database = process.env.DATABASE_URL?.trim();
  if (!database) return LOCAL_DEFAULT;

  if (isSupabaseTransactionPooler(database)) {
    throw new Error(
      "Set DIRECT_URL (Supabase direct port 5432) before db:push. See .env.example"
    );
  }

  return database;
}
