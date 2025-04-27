"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { App as CapacitorApp } from "@capacitor/app"
import { StatusBar } from "@capacitor/status-bar"
import { SplashScreen } from "@capacitor/splash-screen"
import { Device } from "@capacitor/device"
import { Keyboard } from "@capacitor/keyboard"
import { ScreenOrientation } from "@capacitor/screen-orientation"
import { Haptics, ImpactStyle } from "@capacitor/haptics"

export function MobileApp({ children }: { children: React.ReactNode }) {
  const [isNative, setIsNative] = useState(false)
  const [deviceInfo, setDeviceInfo] = useState<any>(null)
  const [orientation, setOrientation] = useState("portrait")

  useEffect(() => {
    // Check if running in a Capacitor native app
    const checkPlatform = async () => {
      try {
        const info = await Device.getInfo()
        setIsNative(info.platform !== "web")
        setDeviceInfo(info)

        // Set preferred orientation for the app
        if (info.platform !== "web") {
          await ScreenOrientation.lock({ orientation: "portrait" })

          // Hide the splash screen with a fade
          await SplashScreen.hide({
            fadeOutDuration: 500,
          })

          // Set status bar style
          await StatusBar.setStyle({ style: "light" })
          if (info.platform === "android") {
            await StatusBar.setBackgroundColor({ color: "#FF69B4" })
          }

          // Listen for back button on Android
          CapacitorApp.addListener("backButton", ({ canGoBack }) => {
            if (!canGoBack) {
              CapacitorApp.exitApp()
            } else {
              window.history.back()
            }
          })

          // Handle keyboard events
          Keyboard.addListener("keyboardWillShow", (info) => {
            // Adjust UI when keyboard appears
            document.body.classList.add("keyboard-visible")
          })

          Keyboard.addListener("keyboardWillHide", () => {
            // Reset UI when keyboard disappears
            document.body.classList.remove("keyboard-visible")
          })

          // Listen for orientation changes
          ScreenOrientation.addListener("orientationChange", ({ type }) => {
            setOrientation(type)
          })
        }
      } catch (error) {
        console.error("Error initializing native features:", error)
        setIsNative(false)
      }
    }

    checkPlatform()

    return () => {
      // Clean up listeners when component unmounts
      if (isNative) {
        CapacitorApp.removeAllListeners()
        Keyboard.removeAllListeners()
        ScreenOrientation.removeAllListeners()
      }
    }
  }, [isNative])

  // Function to trigger haptic feedback
  const triggerHapticFeedback = async () => {
    if (isNative) {
      await Haptics.impact({ style: ImpactStyle.Medium })
    }
  }

  // Apply different styles based on platform
  const getPlatformClass = () => {
    if (!deviceInfo) return ""

    switch (deviceInfo.platform) {
      case "ios":
        return "ios-app"
      case "android":
        return "android-app"
      default:
        return ""
    }
  }

  return (
    <div className={`app-container ${getPlatformClass()} ${orientation}`}>
      {/* Pass native app context to children */}
      {children}

      {/* Add native-specific UI elements if needed */}
      {isNative && deviceInfo?.platform === "ios" && <div className="ios-home-indicator" />}
    </div>
  )
}
