import { NextResponse } from "next/server"
import { createCanvas, loadImage, CanvasRenderingContext2D } from "canvas"
import path from "path"
import fs from "fs"

// List of emotions for the Memes (Finding another ways to use AI here)
const EMOTION_IMAGES = {
  surprised: "/images/surprised.jpg",
  blushing: "/images/blushing.jpg",
  shocked: "/images/shocked.jpg",
}

// This is for the function to wrap text
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const words = text.split(" ")
  const lines = []
  let currentLine = words[0]

  for (let i = 1; i < words.length; i++) {
    const word = words[i]
    const width = ctx.measureText(currentLine + " " + word).width
    if (width < maxWidth) {
      currentLine += " " + word
    } else {
      lines.push(currentLine)
      currentLine = word
    }
  }
  lines.push(currentLine)
  return lines
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

    // This is for getting the image path based on emotion
    const imagePath = path.join(process.cwd(), "public", EMOTION_IMAGES[emotion as keyof typeof EMOTION_IMAGES])

    // This is for creating a unique filename for the output meme
    const outputFilename = `meme-${Date.now()}.png`
    const outputPath = path.join(process.cwd(), "public", "generated", outputFilename)

    // This is for ensuring the output directory exists
    const outputDir = path.join(process.cwd(), "public", "generated")
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    // This is for loading the image
    const image = await loadImage(imagePath)

    // This is for creating a canvas with the same dimensions as the image
    const canvas = createCanvas(image.width, image.height)
    const ctx = canvas.getContext("2d")

    // This is for drawing the image on the canvas
    ctx.drawImage(image, 0, 0, image.width, image.height)

    // This is for setting up the text style
    const fontSize = Math.floor(image.width / 15) // Responsive font size
    ctx.font = `bold ${fontSize}px Impact, sans-serif`
    ctx.textAlign = "center"
    ctx.fillStyle = "white"
    ctx.strokeStyle = "black"
    ctx.lineWidth = fontSize / 15

    // This is for wrapping the caption text
    const maxWidth = image.width * 0.9
    const lines = wrapText(ctx, caption, maxWidth)

    // This is for drawing the text at the bottom of the image
    const lineHeight = fontSize * 1.2
    const totalTextHeight = lines.length * lineHeight
    let y = image.height - totalTextHeight - 20 // Position from bottom with padding

    lines.forEach((line) => {
      // This is for drawing the text stroke
      ctx.strokeText(line, image.width / 2, y)
      // This is for drawing the text fill
      ctx.fillText(line, image.width / 2, y)
      y += lineHeight
    })

    // This is for saving the canvas to a file
    const buffer = canvas.toBuffer("image/png")
    fs.writeFileSync(outputPath, buffer)

    // This is for returning the URL to the generated meme
    return NextResponse.json({
      memeUrl: `/generated/${outputFilename}`,
    })
  } catch (error) {
    console.error("Error in generate-meme API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
