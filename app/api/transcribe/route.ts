import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get("audio") as File

    if (!audioFile) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 })
    }

    // Read the audio file as a buffer
    const arrayBuffer = await audioFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Call Hugging Face Inference API
    const apiKey = process.env.HUGGINGFACE_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "Hugging Face API key not configured" }, { status: 500 })
    }

    const response = await fetch("https://api-inference.huggingface.co/models/facebook/wav2vec2-base-960h", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "audio/wav",
      },
      body: buffer,
    })

    if (!response.ok) {
      const error = await response.text()
      return NextResponse.json({ error: "Hugging Face API error: " + error }, { status: 500 })
    }

    const result = await response.json()
    const transcript = result.text || ""

    return NextResponse.json({ transcript })
  } catch (error) {
    console.error("Error in transcribe API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}
