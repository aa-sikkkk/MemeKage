"use client"

import { useEffect, useState } from "react"
import { CheckCircle, XCircle, AlertCircle } from "lucide-react"

export default function ApiStatus() {
  const [isApiConfigured, setIsApiConfigured] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        // Add a cache-busting query parameter to avoid caching issues
        const response = await fetch(`/api/health?t=${Date.now()}`, {
          // Add headers to ensure we get JSON back
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        })

        // Check if the response is OK
        if (!response.ok) {
          throw new Error(`API returned status ${response.status}`)
        }

        // Try to parse the JSON
        const contentType = response.headers.get("content-type")
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("API did not return JSON")
        }

        const data = await response.json()
        setIsApiConfigured(data.huggingFaceConfigured || false)
        setError(null)
      } catch (error) {
        console.error("Error checking API status:", error)
        setIsApiConfigured(false)
        setError("Could not check API status")
      } finally {
        setIsLoading(false)
      }
    }

    checkApiStatus()
  }, [])

  if (isLoading) {
    return null
  }

  if (error) {
    return (
      <div className="flex items-center justify-center gap-2 text-sm mb-4">
        <AlertCircle className="h-4 w-4 text-yellow-500" />
        <span className="text-yellow-400">API Status Unknown</span>
      </div>
    )
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
