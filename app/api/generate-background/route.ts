import { NextResponse } from "next/server"

// TODO: Uncomment and add your OpenAI API key when ready to use DALL-E
// import OpenAI from "openai"

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// })

export async function POST(request: Request) {
  try {
    const { prompt, size } = await request.json()

    // TODO: Uncomment this section when you have an OpenAI API key
    /*
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: size as "256x256" | "512x512" | "1024x1024",
    })

    const imageUrl = response.data[0].url
    if (!imageUrl) {
      throw new Error("No image URL returned from DALL-E")
    }

    return NextResponse.json({ imageUrl })
    */

    // Temporary fallback: Return a placeholder image
    return NextResponse.json({
      imageUrl: "https://placehold.co/512x512/png",
      message: "DALL-E integration is currently disabled. Add your OpenAI API key to enable it."
    })

  } catch (error) {
    console.error("Error generating background:", error)
    return NextResponse.json(
      { error: "Failed to generate background" },
      { status: 500 }
    )
  }
} 