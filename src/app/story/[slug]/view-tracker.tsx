"use client"

import { useEffect, useRef } from "react"

interface ViewTrackerProps {
  storyId: string
}

export function ViewTracker({ storyId }: ViewTrackerProps) {
  const hasTracked = useRef(false)

  useEffect(() => {
    // Only track once per page load
    if (hasTracked.current) return

    const trackView = async () => {
      try {
        await fetch(`/api/stories/${storyId}/view`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        })
        hasTracked.current = true
      } catch (error) {
        console.error("Failed to track view:", error)
      }
    }

    // Use a small delay to ensure it's a genuine view
    const timer = setTimeout(trackView, 1000)
    return () => clearTimeout(timer)
  }, [storyId])

  return null
}
