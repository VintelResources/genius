// file: lib/db.ts
import "server-only";
import { Pool, PoolClient, QueryResultRow } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var __pgPool__: Pool | undefined;
}

function isRailwayRuntime(): boolean {
  return Boolean(process.env.RAILWAY_ENVIRONMENT_ID || process.env.RAILWAY_PROJECT_ID);
}

function getDatabaseUrl(): string {
  const privateUrl =
    process.env.DATABASE_PRIVATE_URL ||
    process.env.POSTGRES_PRIVATE_URL ||
    process.env.DATABASE_URL_PRIVATE;

  const publicUrl =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.DATABASE_PUBLIC_URL;

  const url = isRailwayRuntime() ? privateUrl || publicUrl : publicUrl || privateUrl;

  if (!url) {
    throw new Error(
      "Missing database URL. Set DATABASE_URL for local/external access and DATABASE_PRIVATE_URL for Railway runtime.",
    );
  }

  return url;
}

function shouldUseSsl(connectionString: string): boolean {
  try {
    const url = new URL(connectionString);
    const host = url.hostname.toLowerCase();
    return !host.endsWith(".railway.internal") && host !== "localhost" && host !== "127.0.0.1";
  } catch {
    return false;
  }
}

export function getPool(): Pool {
  if (!global.__pgPool__) {
    const connectionString = getDatabaseUrl();

    global.__pgPool__ = new Pool({
      connectionString,
      ssl: shouldUseSsl(connectionString) ? { rejectUnauthorized: false } : undefined,
      max: 10,
    });
  }

  return global.__pgPool__;
}

export async function query<T extends QueryResultRow>(
  text: string,
  params: readonly unknown[] = [],
): Promise<T[]> {
  const result = await getPool().query<T>(text, [...params]);
  return result.rows;
}

export async function withTransaction<T>(
  callback: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await getPool().connect();

  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch {
      // preserve original error
    }
    throw error;
  } finally {
    client.release();
  }
}

