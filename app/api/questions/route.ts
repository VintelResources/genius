import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    questions: [],
    message: "Questions API temporarily disabled for production build."
  });
}

export async function POST() {
  return NextResponse.json({
    success: false,
    message: "Questions API temporarily disabled for production build."
  }, { status: 503 });
}
