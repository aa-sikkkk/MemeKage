import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get("audio") as File

    if (!audioFile) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 })
    }

    // Only accept audio/wav for now
    const fileType = audioFile.type || "audio/wav"
    if (fileType !== "audio/wav") {
      return NextResponse.json({ error: "Only audio/wav is supported. Please use the browser's Web Speech API for transcription." }, { status: 400 })
    }

    // (Optional) You can add Hugging Face API logic here for wav files if needed
    // For now, just return a fallback
    return NextResponse.json({ transcript: "[Transcription should be handled on the client using the Web Speech API.]" })
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
