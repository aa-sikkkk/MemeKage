import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { text } = await request.json()

    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 })
    }

    // This is for checking if the API key is configured
    const apiKey = process.env.HUGGINGFACE_API_KEY
    if (!apiKey) {
      console.warn("Hugging Face API key not configured, using fallback caption")

      // This is for getting a random anime-style caption
      const fallbackCaptions = [
        "N-NANI?! This wasn't in the manga!",
        "My power level is OVER 9000!!!",
        "I'm not crying... it's just raining on my face!",
        "This isn't even my final form!",
        "Omae wa mou shindeiru (You are already dead)",
        "B-BAKA! It's not like I made this meme for you!",
      ]
      const caption = fallbackCaptions[Math.floor(Math.random() * fallbackCaptions.length)]

      return NextResponse.json({
        caption,
        isApiConfigured: false,
      })
    }

    // This is for calling the Hugging Face Inference API for GPT-2
    const response = await fetch("https://api-inference.huggingface.co/models/gpt2", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: `Convert this to a funny anime meme caption: "${text}"`,
        parameters: {
          max_length: 100,
          temperature: 0.9,
          top_p: 0.9,
        },
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error("Hugging Face API error:", error)

      // This is for getting a random anime-style caption as fallback
      const fallbackCaptions = [
        "N-NANI?! This wasn't in the manga!",
        "My power level is OVER 9000!!!",
        "I'm not crying... it's just raining on my face!",
        "This isn't even my final form!",
        "Omae wa mou shindeiru (You are already dead)",
        "B-BAKA! It's not like I made this meme for you!",
      ]
      const caption = fallbackCaptions[Math.floor(Math.random() * fallbackCaptions.length)]

      return NextResponse.json({
        caption,
        isApiConfigured: true,
        error: error,
      })
    }

    const result = await response.json()

    // This is for extracting the generated text and cleaning it up
    let caption = result[0]?.generated_text || ""

    // This is for removing the prompt from the beginning
    caption = caption.replace(/Convert this to a funny anime meme caption: ".*?"/, "").trim()

    // This is for providing a fallback if the caption is empty or too short
    if (!caption || caption.length < 10) {
      // This is for getting a random anime-style caption
      const fallbackCaptions = [
        "N-NANI?! This wasn't in the manga!",
        "My power level is OVER 9000!!!",
        "I'm not crying... it's just raining on my face!",
        "This isn't even my final form!",
        "Omae wa mou shindeiru (You are already dead)",
        "B-BAKA! It's not like I made this meme for you!",
      ]
      caption = fallbackCaptions[Math.floor(Math.random() * fallbackCaptions.length)]
    }

    return NextResponse.json({
      caption,
      isApiConfigured: true,
    })
  } catch (error) {
    console.error("Error in generate-caption API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
