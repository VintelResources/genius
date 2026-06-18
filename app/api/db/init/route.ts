import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST() {
  try {
    await query("select 1");
    return NextResponse.json({
      ok: true,
      message: "Database connection verified."
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "Database initialization failed"
      },
      { status: 500 }
    );
  }
}

