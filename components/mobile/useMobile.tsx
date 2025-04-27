"use client"

import { useState, useEffect } from "react"
import { useAppStatus } from "@/contexts/app-status-context"

export function useMobile() {
  const [isMobile, setIsMobile] = useState(false)
  const { isNative, platform, isTablet } = useAppStatus()

  useEffect(() => {
    const checkMobile = () => {
      // Check if we're in a Capacitor environment
      if (isNative) {
        setIsMobile(true)
        return
      }

      // Or check if it's a mobile browser
      const isMobileBrowser = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      setIsMobile(isMobileBrowser)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [isNative])

  return {
    isMobile,
    platform: isNative ? platform : "web",
    isTablet,
    isNative,
  }
}
