"use client"

import { useAppStatus } from "@/contexts/app-status-context"
import { useState, useEffect } from "react"
import { Wifi, WifiOff } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function NetworkStatus() {
  const { isOnline } = useAppStatus()
  const [showAlert, setShowAlert] = useState(false)

  useEffect(() => {
    // Only show the alert if isOnline is defined and false
    if (isOnline === false) {
      setShowAlert(true)
    } else if (isOnline === true) {
      // Hide the alert after a delay when coming back online
      const timer = setTimeout(() => {
        setShowAlert(false)
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [isOnline])

  if (!showAlert) return null

  return (
    <Alert
      variant={isOnline ? "default" : "destructive"}
      className="fixed top-0 left-0 right-0 z-50 m-4 transition-all duration-300"
    >
      {isOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
      <AlertTitle>{isOnline ? "Back Online" : "No Internet Connection"}</AlertTitle>
      <AlertDescription>
        {isOnline
          ? "Your connection has been restored."
          : "Please check your internet connection to continue using all features."}
      </AlertDescription>
    </Alert>
  )
}
