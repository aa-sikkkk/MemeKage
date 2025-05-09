"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Mic, Square, Download, Share2, Loader2, AlertTriangle } from "lucide-react"
import Image from "next/image"

export default function MemeGenerator() {
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [transcript, setTranscript] = useState("")
  const [caption, setCaption] = useState("")
  const [memeUrl, setMemeUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [apiConfigured, setApiConfigured] = useState<boolean | null>(null)
  const [apiWarning, setApiWarning] = useState<string | null>(null)
  const [apiStatus, setApiStatus] = useState<"unknown" | "ok" | "error">("unknown")
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<BlobPart[]>([])

  // Check if the API is working
  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        // Try to call the fallback API to see if API routes are working
        const response = await fetch("/api/fallback")
        if (response.ok) {
          setApiStatus("ok")
        } else {
          setApiStatus("error")
          setApiWarning("API routes may not be working properly. Some features might be limited.")
        }
      } catch (error) {
        console.error("Error checking API status:", error)
        setApiStatus("error")
        setApiWarning("Could not connect to API. Some features might be limited.")
      }
    }

    checkApiStatus()
  }, [])

  // Start/stop recording
  const toggleRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop()
      setIsRecording(false)
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        chunksRef.current.push(e.data)
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" })
        setAudioBlob(audioBlob)
        transcribeAudio(audioBlob)

        // Stop all tracks to release the microphone
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error("Error accessing microphone:", error)
      setApiWarning("Could not access your microphone. Please check permissions and try again.")
    }
  }

  // Transcribe audio using API
  const transcribeAudio = async (blob: Blob) => {
    setIsLoading(true)
    setCurrentStep(2)
    setApiWarning(null)

    // If API routes are not working, use fallback
    if (apiStatus === "error") {
      setTimeout(() => {
        setTranscript("This is a fallback transcription since API routes are not working.")
        setApiWarning("Using fallback transcription as API routes are not working.")
        generateCaption("This is a fallback transcription.")
      }, 1500)
      return
    }

    try {
      const formData = new FormData()
      formData.append("audio", blob)

      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Transcription failed")
      }

      const data = await response.json()
      setTranscript(data.transcript)

      // Check if API is configured
      if (data.isApiConfigured !== undefined) {
        setApiConfigured(data.isApiConfigured)
        if (!data.isApiConfigured) {
          setApiWarning("Using fallback transcription as Hugging Face API key is not configured.")
        }
      }

      // Automatically generate caption after transcription
      generateCaption(data.transcript)
    } catch (error) {
      console.error("Error transcribing audio:", error)
      setTranscript("This is a fallback transcription.")
      setApiWarning("Failed to transcribe audio. Using fallback text.")
      generateCaption("This is a fallback transcription.")
    }
  }

  // Generate caption using API
  const generateCaption = async (text: string) => {
    setCurrentStep(3)

    // If API routes are not working, use fallback
    if (apiStatus === "error") {
      setTimeout(() => {
        const fallbackCaptions = [
          "N-NANI?! This wasn't in the manga!",
          "My power level is OVER 9000!!!",
          "I'm not crying... it's just raining on my face!",
          "This isn't even my final form!",
          "Omae wa mou shindeiru (You are already dead)",
          "B-BAKA! It's not like I made this meme for you!",
        ]
        const caption = fallbackCaptions[Math.floor(Math.random() * fallbackCaptions.length)]
        setCaption(caption)
        setApiWarning("Using fallback caption as API routes are not working.")
        generateMeme(caption)
      }, 1500)
      return
    }

    try {
      const response = await fetch("/api/generate-caption", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      })

      if (!response.ok) {
        throw new Error("Caption generation failed")
      }

      const data = await response.json()
      setCaption(data.caption)

      // Check if API is configured
      if (data.isApiConfigured !== undefined) {
        setApiConfigured(data.isApiConfigured)
        if (!data.isApiConfigured) {
          setApiWarning("Using fallback caption as Hugging Face API key is not configured.")
        }
      }

      // Automatically generate meme after caption
      generateMeme(data.caption)
    } catch (error) {
      console.error("Error generating caption:", error)

      // Fallback caption
      const fallbackCaptions = [
        "N-NANI?! This wasn't in the manga!",
        "My power level is OVER 9000!!!",
        "I'm not crying... it's just raining on my face!",
        "This isn't even my final form!",
        "Omae wa mou shindeiru (You are already dead)",
        "B-BAKA! It's not like I made this meme for you!",
      ]
      const caption = fallbackCaptions[Math.floor(Math.random() * fallbackCaptions.length)]

      setCaption(caption)
      setApiWarning("Failed to generate caption. Using a random anime caption instead.")
      generateMeme(caption)
    }
  }

  // Generate meme using API
  const generateMeme = async (captionText: string) => {
    setCurrentStep(4)

    // If API routes are not working, use fallback
    if (apiStatus === "error") {
      setTimeout(() => {
        // Use a placeholder image
        setMemeUrl("/images/anime1.jpg")
        setApiWarning("Using placeholder image as API routes are not working.")
        setIsLoading(false)
      }, 1500)
      return
    }

    try {
      const response = await fetch("/api/generate-meme", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ caption: captionText }),
      })

      if (!response.ok) {
        throw new Error("Meme generation failed")
      }

      const data = await response.json()
      setMemeUrl(data.memeUrl)
      setIsLoading(false)
    } catch (error) {
      console.error("Error generating meme:", error)
      // Use a placeholder image
      setMemeUrl("/images/anime1.jpg")
      setApiWarning("Failed to generate meme. Using a placeholder image.")
      setIsLoading(false)
    }
  }

  // Download meme
  const downloadMeme = () => {
    if (!memeUrl) return

    const link = document.createElement("a")
    link.href = memeUrl
    link.download = "anime-meme.png"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Share meme
  const shareMeme = async () => {
    if (!memeUrl) return

    if (navigator.share) {
      try {
        // Convert data URL to blob for sharing
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

  // Reset everything to start over
  const resetGenerator = () => {
    setAudioBlob(null)
    setTranscript("")
    setCaption("")
    setMemeUrl("")
    setCurrentStep(1)
    setApiWarning(null)
  }

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
          {/* Step 1: Record Audio */}
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
                {isRecording ? <Square className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
              </Button>
            </div>

            <p className="text-center text-purple-200">
              {isRecording ? "Recording... Click to stop" : "Click to start recording"}
            </p>
          </div>

          {/* Step 2: Transcription */}
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

          {/* Step 3: Caption */}
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

          {/* Step 4: Final Meme */}
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

          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-12 w-12 animate-spin text-purple-400" />
              <p className="mt-4 text-purple-200">
                {currentStep === 2 && "Transcribing your voice..."}
                {currentStep === 3 && "Generating anime caption..."}
                {currentStep === 4 && "Creating your meme..."}
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
