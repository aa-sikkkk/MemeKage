import { NextResponse } from "next/server"
import OpenAI from "openai"

// Uncomment and add your OpenAI API key to use AI-based detection
// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// })

// I'm using simple DIY detection for this project 
// because I don't have access to the OpenAI API key
// and I want to keep the code simple and self-contained.


// Simple keyword-based emotion detection
const EMOTION_KEYWORDS = {
  surprised: [
    "wow", "oh", "what", "surprise", "amazing", "unexpected", "shock", "surprised",
    "surprising", "incredible", "unbelievable", "wow", "whoa", "holy", "my god"
  ],
  blushing: [
    "cute", "adorable", "embarrassed", "shy", "blush", "flustered", "nervous",
    "awkward", "sweet", "lovely", "pretty", "beautiful", "handsome", "attractive"
  ],
  shocked: [
    "shocked", "horrified", "terrified", "scared", "frightened", "afraid",
    "fear", "horror", "terror", "scary", "frightening", "terrifying"
  ]
}

export async function POST(request: Request) {
  try {
    const { text, useAI = false } = await request.json()

    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 })
    }

    // Uncomment this section when you have an OpenAI API key
    /*
    if (useAI) {
      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are an emotion detection system. Analyze the text and respond with ONLY one of these emotions: surprised, blushing, shocked. No other text."
            },
            {
              role: "user",
              content: text
            }
          ],
          temperature: 0.3,
          max_tokens: 10
        })

        const emotion = completion.choices[0].message.content?.toLowerCase().trim()
        
        if (!emotion || !["surprised", "blushing", "shocked"].includes(emotion)) {
          throw new Error("Invalid emotion detected")
        }

        return NextResponse.json({ emotion, method: "ai" })
      } catch (error) {
        console.error("AI emotion detection failed, falling back to keyword detection")
      }
    }
    */

    // Keyword-based emotion detection (fallback)
    const lowerText = text.toLowerCase()
    let maxMatches = 0
    let detectedEmotion = "surprised" // default emotion

    // Iterate through the EMOTION_KEYWORDS object
    for (const [emotion, keywords] of Object.entries(EMOTION_KEYWORDS)) {
      const matches = keywords.filter(keyword => lowerText.includes(keyword)).length
      if (matches > maxMatches) {
        maxMatches = matches
        detectedEmotion = emotion
      }
    }

    return NextResponse.json({ 
      emotion: detectedEmotion,
      method: "keyword",
      confidence: maxMatches > 0 ? "high" : "low"
    })
  } catch (error) {
    console.error("Error in detect-emotion API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 