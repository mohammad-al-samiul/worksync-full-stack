const LOCAL_DEFAULT =
  "postgresql://postgres:postgres@127.0.0.1:5432/worksync?schema=public";

/** Supabase transaction pooler (port 6543) — Prisma CLI cannot use this for db push. */
export function isSupabaseTransactionPooler(url: string): boolean {
  return /:6543(\/|$|\?)/.test(url);
}

/**
 * App runtime — use DATABASE_URL (pooler OK with ?pgbouncer=true for Supabase).
 */
export function getAppDatabaseUrl(): string {
  const raw = process.env.DATABASE_URL?.trim() || LOCAL_DEFAULT;
  if (!isSupabaseTransactionPooler(raw)) {
    return raw;
  }
  try {
    const parsed = new URL(raw);
    if (!parsed.searchParams.has("pgbouncer")) {
      parsed.searchParams.set("pgbouncer", "true");
    }
    // Do not set sslmode here — pg Pool uses ssl.rejectUnauthorized in pg-pool.ts
    return parsed.toString();
  } catch {
    const sep = raw.includes("?") ? "&" : "?";
    return `${raw}${sep}pgbouncer=true`;
  }
}

/**
 * Prisma CLI (db push, migrate, studio) — must use direct/session port 5432, not :6543.
 */
export function getCliDatabaseUrl(): string {
  const direct = process.env.DIRECT_URL?.trim();
  if (direct) {
    return direct;
  }

  const database = process.env.DATABASE_URL?.trim();
  if (!database) {
    return LOCAL_DEFAULT;
  }

  if (isSupabaseTransactionPooler(database)) {
    throw new Error(
      [
        "DATABASE_URL uses Supabase pooler port 6543. Prisma db push / migrate will hang.",
        "",
        "Fix: In Supabase → Project Settings → Database, copy the Direct connection string",
        "and add it to .env as DIRECT_URL (port 5432, not 6543).",
        "",
        "Example .env:",
        "  DATABASE_URL=\"...pooler.supabase.com:6543/postgres?pgbouncer=true\"",
        "  DIRECT_URL=\"...supabase.co:5432/postgres?sslmode=require\"",
      ].join("\n")
    );
  }

  return database;
}
