"use client"

import { useState, useRef } from "react"
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
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<BlobPart[]>([])

  // This function is for the recording start/stop Button
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

        // This is for stopping the microphone after recording
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error("Error accessing microphone:", error)
      alert("Could not access your microphone. Please check permissions and try again.")
    }
  }

  // This function is for transcribing the audio
  const transcribeAudio = async (blob: Blob) => {
    setIsLoading(true)
    setCurrentStep(2)
    setApiWarning(null)

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

      // This is for checking if the API is configured
      if (data.isApiConfigured !== undefined) {
        setApiConfigured(data.isApiConfigured)
        if (!data.isApiConfigured) {
          setApiWarning("Using fallback transcription as Hugging Face API key is not configured.")
        }
      }

      // This is for generating the caption after transcription
      generateCaption(data.transcript)
    } catch (error) {
      console.error("Error transcribing audio:", error)
      alert("Failed to transcribe audio. Using fallback text.")
      setTranscript("This is a fallback transcription.")
      generateCaption("This is a fallback transcription.")
    }
  }

  // This is for generating the caption using API
  const generateCaption = async (text: string) => {
    setCurrentStep(3)
    setApiWarning(null)

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

      // This is for checking if the API is configured
      if (data.isApiConfigured !== undefined) {
        setApiConfigured(data.isApiConfigured)
        if (!data.isApiConfigured) {
          setApiWarning("Using fallback caption as Hugging Face API key is not configured.")
        }
      }

      // This is for generating the meme after caption
      generateMeme(data.caption)
    } catch (error) {
      console.error("Error generating caption:", error)

      // This is for the fallback caption
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

  // This is for generating the meme using API
  const generateMeme = async (captionText: string) => {
    setCurrentStep(4)

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
      setApiWarning("Failed to generate meme. Please try again.")
      setIsLoading(false)
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
                {isRecording ? <Square className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
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
