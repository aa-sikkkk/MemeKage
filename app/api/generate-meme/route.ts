import { NextResponse } from "next/server"

// List of emotions for the Memes
const EMOTION_IMAGES = {
  surprised: "/images/surprised.jpg",
  blushing: "/images/blushing.jpg",
  shocked: "/images/shocked.jpg",
}

export async function POST(request: Request) {
  try {
    const { caption, emotion } = await request.json()

    if (!caption) {
      return NextResponse.json({ error: "No caption provided" }, { status: 400 })
    }

    if (!emotion || !EMOTION_IMAGES[emotion as keyof typeof EMOTION_IMAGES]) {
      return NextResponse.json({ error: "Invalid or missing emotion" }, { status: 400 })
    }

    // Return the image path and caption for client-side processing
    return NextResponse.json({
      imagePath: EMOTION_IMAGES[emotion as keyof typeof EMOTION_IMAGES],
      caption,
      message: "Use client-side canvas for meme generation"
    })
  } catch (error) {
    console.error("Error in generate-meme API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}