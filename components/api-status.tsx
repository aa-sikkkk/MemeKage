"use client"

import { useEffect, useState } from "react"
import { CheckCircle, XCircle } from "lucide-react"

// This is for the API status for the MemeKage
export default function ApiStatus() {
  const [isApiConfigured, setIsApiConfigured] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        const response = await fetch("/api/health")
        const data = await response.json()
        setIsApiConfigured(data.huggingFaceConfigured || false)
      } catch (error) {
        console.error("Error checking API status:", error)
        setIsApiConfigured(false)
      } finally {
        setIsLoading(false)
      }

    }

    checkApiStatus()
  }, [])

  if (isLoading) {
    return null
  }

  return (
    <div className="flex items-center justify-center gap-2 text-sm mb-4">
      {isApiConfigured ? (
        <> 
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span className="text-green-400">API Connected</span>
        </>
      ) : (
        <>
          <XCircle className="h-4 w-4 text-red-500" />
          <span className="text-red-400">API Not Configured</span>
        </>
      )}
    </div>
  )
}
