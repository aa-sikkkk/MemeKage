import { NextResponse } from "next/server"

// This is for the health check for the MemeKage
export async function GET() {
  const huggingFaceApiKey = process.env.HUGGINGFACE_API_KEY

  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    huggingFaceConfigured: !!huggingFaceApiKey,
  })
}
