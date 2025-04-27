"use client"

import { useEffect, useState } from "react"
import { ScreenOrientation } from "@capacitor/screen-orientation"
import { useAppStatus } from "@/contexts/app-status-context"

export function OrientationWarning() {
  const [showWarning, setShowWarning] = useState(false)
  const { isNative } = useAppStatus()

  useEffect(() => {
    if (!isNative) return

    const checkOrientation = async () => {
      if (!isNative) {
        setShowWarning(false)
        return
      }

      try {
        // Only attempt to use ScreenOrientation API in native environments
        const orientation = await ScreenOrientation.getCurrentOrientation()
        setShowWarning(orientation.type.includes("landscape"))

        // Add event listener for orientation changes
        ScreenOrientation.addListener("orientationChange", ({ type }) => {
          setShowWarning(type.includes("landscape"))
        })
      } catch (error) {
        console.error("Error checking orientation:", error)
        setShowWarning(false)
      }
    }

    checkOrientation()

    return () => {
      ScreenOrientation.removeAllListeners()
    }
  }, [isNative])

  if (!showWarning) return null

  return (
    <div className="orientation-warning">
      <div className="p-6 text-center">
        <h2 className="text-2xl font-bold mb-4">Please Rotate Your Device</h2>
        <p>This app works best in portrait mode.</p>
        <div className="mt-4 text-5xl animate-pulse">📱↺</div>
      </div>
    </div>
  )
}
