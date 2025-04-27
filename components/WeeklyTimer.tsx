"use client"

import { useState, useEffect } from "react"
import { theme } from "@/config/theme"

export function WeeklyTimer() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 })
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date()
      const endOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() + (7 - now.getDay()))
      endOfWeek.setHours(23, 59, 59, 999)

      const totalSeconds = (endOfWeek.getTime() - now.getTime()) / 1000
      const days = Math.floor(totalSeconds / 86400)
      const hours = Math.floor((totalSeconds % 86400) / 3600)
      const minutes = Math.floor((totalSeconds % 3600) / 60)

      setTimeLeft({ days, hours, minutes })

      const weekProgress = ((7 * 24 * 60 * 60 - totalSeconds) / (7 * 24 * 60 * 60)) * 100
      setProgress(weekProgress)
    }, 60000) // Update every minute

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="w-full bg-gradient-to-r from-pink-200 to-purple-200 p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-500 font-serif">
        Weekly Winner
      </h2>
      <div className="w-full h-4 bg-white rounded-full mb-4 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-in-out"
          style={{
            width: `${progress}%`,
            background: `linear-gradient(45deg, 
              ${theme.colors.primary} 0%, 
              ${theme.colors.accent} 25%, 
              ${theme.colors.secondary} 50%, 
              ${theme.colors.accent} 75%, 
              ${theme.colors.primary} 100%)`,
            backgroundSize: "200% 200%",
            animation: "gradient 5s ease infinite",
          }}
        />
      </div>
      <div className="flex justify-between items-center text-lg font-semibold text-purple-700">
        <span className="font-serif">Time Left:</span>
        <span className="font-serif">
          {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m
        </span>
      </div>
    </div>
  )
}
