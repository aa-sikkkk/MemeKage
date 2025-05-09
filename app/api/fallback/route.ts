import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "Fallback API is working",
    timestamp: new Date().toISOString(),
  })
}
// This is for the fallback API for the MemeKage