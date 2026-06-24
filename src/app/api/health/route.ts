import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    app: "Proyecto Finanzas Personales",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV ?? "unknown",
  });
}
