"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type AppStatus = {
  isNative: boolean
  platform: "ios" | "android" | "web"
  isTablet: boolean
  isOnline: boolean
  batteryLevel?: number
  isMiniRoomLoaded?: boolean
  setAppStatus: (status: Partial<AppStatus>) => void
}

const defaultStatus: AppStatus = {
  isNative: false,
  platform: "web",
  isTablet: false,
  isOnline: true,
  batteryLevel: 100,
  isMiniRoomLoaded: false,
  setAppStatus: () => {},
}

const AppStatusContext = createContext<AppStatus>(defaultStatus)

export function AppStatusProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Omit<AppStatus, "setAppStatus">>(defaultStatus)

  // Update app status
  const updateAppStatus = (newStatus: Partial<AppStatus>) => {
    setStatus((prevStatus) => ({
      ...prevStatus,
      ...newStatus,
    }))
  }

  // Detect platform and device type
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase()
    const isIOS = /iphone|ipad|ipod/.test(userAgent)
    const isAndroid = /android/.test(userAgent)
    const isTablet =
      /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/.test(
        userAgent,
      )

    // Check if running in Capacitor - safely
    const isNative =
      typeof window !== "undefined" &&
      typeof (window as any).Capacitor !== "undefined" &&
      (window as any).Capacitor.isNative === true

    let platform: "ios" | "android" | "web" = "web"
    if (isNative) {
      if (isIOS) platform = "ios"
      else if (isAndroid) platform = "android"
    }

    updateAppStatus({
      isNative,
      platform,
      isTablet,
      isOnline: navigator.onLine, // Initialize with browser's online status
    })

    // Network status listener
    const handleOnline = () => updateAppStatus({ isOnline: true })
    const handleOffline = () => updateAppStatus({ isOnline: false })

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  const contextValue = {
    ...status,
    setAppStatus: updateAppStatus,
  }

  return <AppStatusContext.Provider value={contextValue}>{children}</AppStatusContext.Provider>
}

export const useAppStatus = () => useContext(AppStatusContext)
