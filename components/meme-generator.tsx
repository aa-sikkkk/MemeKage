"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
// import { Textarea } from "@/components/ui/textarea"
import { Mic, MicOff, Square, Download, Share2, Loader2, AlertTriangle } from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"
import { MemeCustomizer, MemeSettings } from "./meme-customizer"

export default function MemeGenerator() {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [transcript, setTranscript] = useState("")
  const [caption, setCaption] = useState("")
  const [memeUrl, setMemeUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [apiConfigured, setApiConfigured] = useState<boolean | null>(null)
  const [apiWarning, setApiWarning] = useState<string | null>(null)
  const [useAI, setUseAI] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<BlobPart[]>([])
  const audioChunks = useRef<Blob[]>([])
  const [memeSettings, setMemeSettings] = useState<MemeSettings>({
    text: {
      top: "",
      bottom: "",
      font: "Impact",
      size: 48,
      color: "#ffffff",
      strokeColor: "#000000",
      strokeWidth: 2,
      position: {
        x: 0,
        y: 0
      },
      rotation: 0
    },
    effects: {
      brightness: 100,
      contrast: 100,
      saturation: 100,
      blur: 0
    },
    filters: [],
    stickers: [],
    dalle: {
      enabled: false,
      prompt: "",
      style: "anime",
      size: "512x512"
    }
  })

  // This function is for the recording start/stop Button
  const toggleRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop()
      setIsRecording(false)
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)
      audioChunks.current = []

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data)
      }

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' })
        await processAudio(audioBlob)
      }

      mediaRecorderRef.current.start()
      setIsRecording(true)
    } catch (error) {
      toast.error("Error accessing microphone")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true)
    try {
      // Use Web Speech API for transcription
      const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)()
      recognition.lang = 'en-US'
      recognition.continuous = false
      recognition.interimResults = false

      recognition.onresult = async (event) => {
        const text = event.results[0][0].transcript
        setTranscript(text)

        // Detect emotion from transcribed text
        const emotionResponse = await fetch('/api/detect-emotion', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, useAI })
        })

        const { emotion, method, confidence } = await emotionResponse.json()
        
        if (confidence === "low") {
          toast.warning("Low confidence in emotion detection. Try rephrasing or using AI detection.")
        }

        // Generate meme with detected emotion
        const memeResponse = await fetch('/api/generate-meme', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ caption: text, emotion })
        })

        const { memeUrl } = await memeResponse.json()
        setMemeUrl(memeUrl)
        toast.success(`Meme generated using ${method} detection!`)
      }

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        toast.error("Error processing speech")
      }

      recognition.start()
    } catch (error) {
      toast.error("Error processing audio")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleTextSubmit = async () => {
    if (!transcript) {
      toast.error("Please enter a caption or use voice input...")
      return
    }

    setIsProcessing(true)
    try {
      // Detect emotion from text
      const emotionResponse = await fetch('/api/detect-emotion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: transcript, useAI })
      })

      const { emotion, method, confidence } = await emotionResponse.json()
      
      if (confidence === "low") {
        toast.warning("Low confidence in emotion detection. Try rephrasing or using AI detection.")
      }

      // Generate meme
      const memeResponse = await fetch('/api/generate-meme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caption: transcript, emotion })
      })

      const { memeUrl } = await memeResponse.json()
      setMemeUrl(memeUrl)
      toast.success(`Meme generated using ${method} detection!`)
    } catch (error) {
      toast.error("Error generating meme")
    } finally {
      setIsProcessing(false)
    }
  }

  // This is for downloading the meme
  const downloadMeme = () => {
    if (!memeUrl) return

    const link = document.createElement("a")
    link.href = memeUrl
    link.download = "anime-meme.png"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // This is for sharing the meme
  const shareMeme = async () => {
    if (!memeUrl) return

    if (navigator.share) {
      try {
        // This is for converting the data URL to blob for sharing
        const response = await fetch(memeUrl)
        const blob = await response.blob()
        const file = new File([blob], "anime-meme.png", { type: "image/png" })

        await navigator.share({
          title: "My Anime Meme",
          text: "Check out this anime meme I created!",
          files: [file],
        })
      } catch (error) {
        console.error("Error sharing:", error)
      }
    } else {
      alert("Web Share API not supported in your browser. Try downloading instead.")
    }
  }

  // This is for resetting the generator
  const resetGenerator = () => {
    setAudioBlob(null)
    setTranscript("")
    setCaption("")
    setMemeUrl("")
    setCurrentStep(1)
    setApiWarning(null)
  }

  const handleCustomize = (newSettings: MemeSettings) => {
    setMemeSettings(newSettings)
  }

  const applyEffects = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Apply image effects
    ctx.filter = `
      brightness(${memeSettings.effects.brightness}%)
      contrast(${memeSettings.effects.contrast}%)
      saturate(${memeSettings.effects.saturation}%)
      blur(${memeSettings.effects.blur}px)
      ${memeSettings.filters.map(filter => {
        switch (filter) {
          case "grayscale": return "grayscale(100%)"
          case "sepia": return "sepia(100%)"
          case "invert": return "invert(100%)"
          case "hue-rotate": return "hue-rotate(90deg)"
          case "saturate": return "saturate(200%)"
          default: return ""
        }
      }).join(" ")}
    `
  }

  const drawText = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number) => {
    ctx.save()
    ctx.font = `${memeSettings.text.size}px ${memeSettings.text.font}`
    ctx.fillStyle = memeSettings.text.color
    ctx.strokeStyle = memeSettings.text.strokeColor
    ctx.lineWidth = memeSettings.text.strokeWidth
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    
    // Apply rotation
    ctx.translate(x, y)
    ctx.rotate((memeSettings.text.rotation * Math.PI) / 180)
    ctx.translate(-x, -y)

    // Draw text with stroke
    ctx.strokeText(text, x, y)
    ctx.fillText(text, x, y)
    ctx.restore()
  }

  const drawStickers = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    memeSettings.stickers.forEach((sticker, index) => {
      // Load and draw sticker images
      const img = new window.Image()
      img.src = `/stickers/${sticker}.png`
      img.onload = () => {
        const x = (index % 3) * (canvas.width / 3)
        const y = Math.floor(index / 3) * (canvas.height / 3)
        ctx.drawImage(img, x, y, 50, 50)
      }
    })
  }

  const generateDalleBackground = async (prompt: string, style: string, size: string) => {
    try {
      const response = await fetch('/api/generate-background', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: `${prompt}, ${style} style`,
          size
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate background')
      }

      const { imageUrl } = await response.json()
      return imageUrl
    } catch (error) {
      console.error('Error generating background:', error)
      toast.error('Failed to generate background')
      return null
    }
  }

  const generateMeme = async (memeUrlParam: string, transcriptParam: string) => {
    let backgroundImageUrl = "";
    let caption = transcriptParam;

    // 1. If DALL-E is enabled, use DALL-E background
    if (memeSettings.dalle.enabled && memeSettings.dalle.prompt) {
      try {
        const dalleImageUrl = await generateDalleBackground(
          memeSettings.dalle.prompt,
          memeSettings.dalle.style,
          memeSettings.dalle.size
        );
        if (dalleImageUrl) {
          backgroundImageUrl = dalleImageUrl;
          toast.success("DALL-E background generated successfully!");
        }
      } catch (error) {
        console.error("Error generating DALL-E background:", error);
        toast.error("Failed to generate DALL-E background. Using emotion image.");
      }
    }

    // 2. If DALL-E is not enabled or failed, use the emotion image
    if (!backgroundImageUrl) {
      // Get emotion from /api/detect-emotion
      const emotionRes = await fetch('/api/detect-emotion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: transcriptParam, useAI })
      });
      const { emotion } = await emotionRes.json();
      // Get imagePath from /api/generate-meme
      const memeRes = await fetch('/api/generate-meme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caption: transcriptParam, emotion })
      });
      const { imagePath } = await memeRes.json();
      backgroundImageUrl = imagePath;
    }

    // Now generate the meme as before
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = backgroundImageUrl;
    await new Promise((resolve) => {
      img.onload = resolve;
    });

    canvas.width = img.width;
    canvas.height = img.height;

    // Draw base image
    ctx.drawImage(img, 0, 0);

    // Apply effects
    applyEffects(canvas);

    // Draw text
    const topY = canvas.height * 0.1 + memeSettings.text.position.y;
    const bottomY = canvas.height * 0.9 + memeSettings.text.position.y;
    const centerX = canvas.width / 2 + memeSettings.text.position.x;

    if (memeSettings.text.top) {
      drawText(ctx, memeSettings.text.top, centerX, topY);
    }
    if (memeSettings.text.bottom) {
      drawText(ctx, memeSettings.text.bottom, centerX, bottomY);
    }

    // Draw stickers
    drawStickers(ctx, canvas);

    // Convert to data URL and set as memeUrl
    const dataUrl = canvas.toDataURL("image/png");
    setMemeUrl(dataUrl);
    setCurrentStep(4);
  }

  // New function to handle the full meme generation flow
  const handleGenerateMeme = async () => {
    let safeTranscript = transcript;
    if (!safeTranscript || safeTranscript.trim() === "") {
      // Provide a default caption if none is available
      safeTranscript = "N-NANI?! This wasn't in the manga!";
    }
    setIsProcessing(true);
    try {
      // 1. Detect emotion
      const emotionRes = await fetch('/api/detect-emotion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: safeTranscript, useAI })
      });
      const { emotion } = await emotionRes.json();

      // 2. Get imagePath from /api/generate-meme
      const memeRes = await fetch('/api/generate-meme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caption: safeTranscript, emotion })
      });
      const { imagePath } = await memeRes.json();

      // 3. Use imagePath as background (unless DALL-E is enabled)
      let backgroundImageUrl = imagePath;
      if (memeSettings.dalle.enabled && memeSettings.dalle.prompt) {
        try {
          const dalleImageUrl = await generateDalleBackground(
            memeSettings.dalle.prompt,
            memeSettings.dalle.style,
            memeSettings.dalle.size
          );
          if (dalleImageUrl) {
            backgroundImageUrl = dalleImageUrl;
            toast.success("DALL-E background generated successfully!");
          }
        } catch (error) {
          toast.error("Failed to generate DALL-E background. Using emotion image.");
        }
      }

      // Generate meme with the chosen background and safe caption
      await generateMemeWithBackground(backgroundImageUrl, safeTranscript);
    } catch (error) {
      toast.error("Error generating meme");
    } finally {
      setIsProcessing(false);
    }
  };

  // Update generateMemeWithBackground to accept the caption
  const generateMemeWithBackground = async (backgroundImageUrl: string, caption: string) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = backgroundImageUrl;
    await new Promise((resolve) => {
      img.onload = resolve;
    });

    canvas.width = img.width;
    canvas.height = img.height;

    // Draw base image
    ctx.drawImage(img, 0, 0);

    // Apply effects
    applyEffects(canvas);

    // Draw text (always use the provided caption)
    const topY = canvas.height * 0.1 + memeSettings.text.position.y;
    const bottomY = canvas.height * 0.9 + memeSettings.text.position.y;
    const centerX = canvas.width / 2 + memeSettings.text.position.x;

    if (caption) {
      drawText(ctx, caption, centerX, topY);
    }

    // Draw stickers
    drawStickers(ctx, canvas);

    // Convert to data URL and set as memeUrl
    const dataUrl = canvas.toDataURL("image/png");
    setMemeUrl(dataUrl);
    setCurrentStep(4);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="p-6 bg-white/10 backdrop-blur-sm border-purple-500/30">
        {apiWarning && (
          <div className="mb-6 p-3 bg-yellow-500/20 border border-yellow-500/50 rounded-md flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <p className="text-yellow-200 text-sm">{apiWarning}</p>
          </div>
        )}

        <div className="space-y-8">
          {/* Add AI toggle switch */}
          <div className="flex items-center justify-end space-x-2">
            <label htmlFor="ai-toggle" className="text-sm text-purple-200">
              Use AI Detection
            </label>
            <Button
              variant={useAI ? "default" : "outline"}
              onClick={() => setUseAI(!useAI)}
              className="w-12"
            >
              {useAI ? "ON" : "OFF"}
            </Button>
          </div>

          {/* This is the first step for recording the voice */ }
          <div className={`transition-opacity ${currentStep === 1 ? "opacity-100" : "opacity-50"}`}>
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <span className="bg-purple-600 text-white rounded-full w-8 h-8 inline-flex items-center justify-center mr-2">
                1
              </span>
              Record Your Voice
            </h2>

            <div className="flex justify-center my-6">
              <Button
                onClick={toggleRecording}
                size="lg"
                className={`rounded-full w-20 h-20 ${isRecording ? "bg-red-500 hover:bg-red-600" : "bg-purple-600 hover:bg-purple-700"}`}
              >
                {isRecording ? <MicOff className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
              </Button>
            </div>

            <p className="text-center text-purple-200">
              {isRecording ? "Recording... Click to stop" : "Click to start recording"}
            </p>
          </div>

          {/* This is the second step for transcription */}
          {transcript && (
            <div className={`transition-opacity ${currentStep === 2 ? "opacity-100" : "opacity-50"}`}>
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <span className="bg-purple-600 text-white rounded-full w-8 h-8 inline-flex items-center justify-center mr-2">
                  2
                </span>
                Transcription
              </h2>
              <div className="bg-black/30 p-4 rounded-lg">
                <p className="text-lg">{transcript}</p>
              </div>
            </div>
          )}

            {/* This is the third step for caption */}
          {caption && (
            <div className={`transition-opacity ${currentStep === 3 ? "opacity-100" : "opacity-50"}`}>
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <span className="bg-purple-600 text-white rounded-full w-8 h-8 inline-flex items-center justify-center mr-2">
                  3
                </span>
                Anime Caption
              </h2>
              <div className="bg-black/30 p-4 rounded-lg">
                <p className="text-lg font-bold text-yellow-300">{caption}</p>
              </div>
            </div>
          )}

            {/* This is the fourth step for the final meme */}
          {memeUrl && (
            <div className={`transition-opacity ${currentStep === 4 ? "opacity-100" : "opacity-50"}`}>
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <span className="bg-purple-600 text-white rounded-full w-8 h-8 inline-flex items-center justify-center mr-2">
                  4
                </span>
                Your Anime Meme
              </h2>
              <div className="bg-black/30 p-4 rounded-lg flex justify-center">
                <div className="relative">
                  <Image
                    src={memeUrl || "/placeholder.svg"}
                    alt="Generated anime meme"
                    width={500}
                    height={500}
                    className="rounded-lg max-w-full h-auto"
                  />
                </div>
              </div>

              <div className="flex justify-center gap-4 mt-6">
                <Button onClick={downloadMeme} className="bg-green-600 hover:bg-green-700">
                  <Download className="mr-2 h-4 w-4" /> Download
                </Button>
                <Button onClick={shareMeme} className="bg-blue-600 hover:bg-blue-700">
                  <Share2 className="mr-2 h-4 w-4" /> Share
                </Button>
                <Button onClick={resetGenerator} variant="outline" className="border-purple-400 text-purple-200">
                  Create Another
                </Button>
              </div>
            </div>
          )}

          {/* This is for the loading state */}
          {isProcessing && (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-12 w-12 animate-spin text-purple-400" />
              <p className="mt-4 text-purple-200">
                Processing...
              </p>
            </div>
          )}

          <div className="space-y-4">
            <MemeCustomizer
              settings={memeSettings}
              onCustomize={handleCustomize}
            />
            
            {transcript && (
              <Button
                onClick={handleGenerateMeme}
                disabled={isProcessing}
                className="w-full"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Generate Meme"
                )}
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}
