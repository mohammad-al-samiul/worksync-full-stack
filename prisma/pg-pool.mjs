/**
 * Shared pg Pool config for seed script (mirrors src/lib/pg-pool.ts)
 */
import pg from "pg";

const { Pool } = pg;

function isLocalDatabase(url) {
  return /(?:localhost|127\.0\.0\.1)/i.test(url);
}

function needsPgSsl(url) {
  if (isLocalDatabase(url)) return false;
  if (/sslmode=disable/i.test(url)) return false;
  return true;
}

function stripSslModeFromUrl(connectionString) {
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

export function createPgPool(connectionString) {
  const useSsl = needsPgSsl(connectionString);
  const config = {
    connectionString: stripSslModeFromUrl(connectionString),
    connectionTimeoutMillis: 15_000,
    idleTimeoutMillis: 20_000,
  };

  if (useSsl) {
    config.ssl = { rejectUnauthorized: false };
  }

  return new Pool(config);
}
