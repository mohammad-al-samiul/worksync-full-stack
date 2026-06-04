import { Pool, type PoolConfig } from "pg";

function isLocalDatabase(url: string): boolean {
  return /(?:localhost|127\.0\.0\.1)/i.test(url);
}

/** Remote Postgres (Supabase, etc.) needs explicit SSL for the `pg` driver on Windows. */
export function needsPgSsl(url: string): boolean {
  if (isLocalDatabase(url)) return false;
  if (/sslmode=disable/i.test(url)) return false;
  return true;
}

/** Remove sslmode from URL so Pool `ssl` option controls TLS (avoids verify-full + cert errors). */
export function stripSslModeFromUrl(connectionString: string): string {
  try {
    const parsed = new URL(connectionString);
    parsed.searchParams.delete("sslmode");
    return parsed.toString();
  } catch {
    return connectionString
      .replace(/([?&])sslmode=[^&]*&?/gi, "$1")
      .replace(/[?&]$/, "");
  }
}

export function getPgPoolOptions(connectionString: string): PoolConfig {
  const useSsl = needsPgSsl(connectionString);
  const config: PoolConfig = {
    connectionString: stripSslModeFromUrl(connectionString),
    connectionTimeoutMillis: 15_000,
    idleTimeoutMillis: 20_000,
  };

  if (useSsl) {
    // Fixes: "self-signed certificate in certificate chain" (Supabase + Node pg on Windows)
    config.ssl = { rejectUnauthorized: false };
  }

  return config;
}

export function createPgPool(connectionString: string): Pool {
  return new Pool(getPgPoolOptions(connectionString));
}
