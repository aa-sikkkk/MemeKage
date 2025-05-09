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

    // Always use a valid emotion, fallback to 'surprised'
    let validEmotion = emotion as keyof typeof EMOTION_IMAGES;
    if (!validEmotion || !EMOTION_IMAGES[validEmotion]) {
      validEmotion = "surprised";
    }

    // Return the image path and caption for client-side processing
    return NextResponse.json({
      imagePath: EMOTION_IMAGES[validEmotion],
      caption,
      message: "Use client-side canvas for meme generation"
    })
  } catch (error) {
    console.error("Error in generate-meme API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}