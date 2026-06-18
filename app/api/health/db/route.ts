import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const rows = await query<{ ok: number }>("select 1 as ok");
    return NextResponse.json({
      ok: true,
      database: rows[0]?.ok === 1 ? "connected" : "unknown"
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        database: "error",
        message: error instanceof Error ? error.message : "Database connection failed"
      },
      { status: 500 }
    );
  }
}

