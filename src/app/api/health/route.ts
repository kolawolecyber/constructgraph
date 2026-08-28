import { NextResponse } from "next/server";
import { checkCognoDBHealth } from "@/infrastructure/database/cognodb/health";

export async function GET() {
  const healthy = await checkCognoDBHealth();

  if (!healthy) {
    return NextResponse.json(
      {
        status: "error",
        message: "Database unavailable",
      },
      { status: 503 }
    );
  }

  return NextResponse.json({
    status: "ok",
  });
}