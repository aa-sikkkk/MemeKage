"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Mic, MicOff, Square, Download, Share2, Loader2, AlertTriangle } from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"

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
        </div>
      </Card>
    </div>
  )
}
