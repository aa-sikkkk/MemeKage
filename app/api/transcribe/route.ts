import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get("audio") as File

    if (!audioFile) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 })
    }

    // This is for converting the file to a buffer for the Hugging Face API
    const arrayBuffer = await audioFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // This is for checking if the API key is configured
    const apiKey = process.env.HUGGINGFACE_API_KEY
    if (!apiKey) {
      console.warn("Hugging Face API key not configured, using fallback transcription")
      return NextResponse.json({
        transcript: "This is a fallback transcription since the API key is not configured.",
        isApiConfigured: false,
      })
    }

    // This is for calling the Hugging Face Inference API for Wav2Vec2
    const response = await fetch("https://api-inference.huggingface.co/models/facebook/wav2vec2-base-960h", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "audio/webm",
      },
      body: buffer,
    })

    if (!response.ok) {
      const error = await response.text()
      console.error("Hugging Face API error:", error)

      // This is for providing a fallback response
      return NextResponse.json({
        transcript: "Could not transcribe audio. Using a placeholder text instead.",
        isApiConfigured: true,
        error: error,
      })
    }

    const result = await response.json()

    return NextResponse.json({
      transcript: result.text,
      isApiConfigured: true,
    })
  } catch (error) {
    console.error("Error in transcribe API:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        transcript: "An error occurred during transcription. Using placeholder text.",
      },
      { status: 500 },
    )
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}
