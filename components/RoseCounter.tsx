"use client"

import { useState, useEffect } from "react"
import { FlowerIcon as Rose } from "lucide-react"
import { Button } from "@/components/ui/button"
import { theme } from "@/config/theme"
import { claimFreeRoses } from "@/actions/rose-actions"
import { useToast } from "@/components/ui/use-toast"
import { useRoses } from "@/contexts/rose-context"

export function RoseCounter() {
  const [timeLeft, setTimeLeft] = useState("05:00")
  const [canClaim, setCanClaim] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { roseCount, updateRoseCount } = useRoses()

  useEffect(() => {
    const checkClaimStatus = async () => {
      try {
        const result = await claimFreeRoses(true) // Just check, don't claim
        if (result.success) {
          setCanClaim(true)
        } else {
          setCanClaim(false)
          if (result.timeLeft) {
            const { minutes, seconds } = result.timeLeft
            setTimeLeft(`${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`)
          }
        }
      } catch (error) {
        console.error("Error checking claim status:", error)
      }
    }

    checkClaimStatus()

    const timer = setInterval(() => {
      const [minutes, seconds] = timeLeft.split(":").map(Number)

      let newSeconds = seconds - 1
      let newMinutes = minutes

      if (newSeconds < 0) {
        newSeconds = 59
        newMinutes -= 1
      }

      if (newMinutes < 0) {
        setCanClaim(true)
        clearInterval(timer)
        return
      }

      setTimeLeft(`${newMinutes.toString().padStart(2, "0")}:${newSeconds.toString().padStart(2, "0")}`)
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft])

  const handleClaim = async () => {
    if (!canClaim) {
      // Show popup when trying to claim early
      toast({
        title: "Cannot Claim Yet",
        description: `Please wait ${timeLeft} before claiming more roses.`,
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const result = await claimFreeRoses()

      if (result.success) {
        toast({
          title: "Success!",
          description: "You claimed 15 roses!",
        })

        // Update the rose count in the context
        updateRoseCount(result.newUserRoses)

        setCanClaim(false)
        // Reset the timer to 5 minutes
        setTimeLeft("05:00")
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error claiming roses:", error)
      toast({
        title: "Error",
        description: "Failed to claim roses. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center space-y-4 p-4 bg-white rounded-lg shadow-md">
      <div className="flex items-center space-x-2">
        <Rose className="h-6 w-6" style={{ color: theme.colors.accent }} />
        {canClaim ? (
          <span className="text-lg font-semibold">Claim your rose!</span>
        ) : (
          <span className="text-lg font-semibold">{timeLeft}</span>
        )}
      </div>
      <Button
        variant="outline"
        size="sm"
        className="px-4 py-2 bg-pink-200 hover:bg-pink-300 text-pink-800 rounded-full transition-colors duration-200"
        onClick={handleClaim}
        disabled={isLoading}
      >
        {isLoading ? (
          "Claiming..."
        ) : (
          <>
            Get 15 free <Rose className="ml-1 h-4 w-4" style={{ color: theme.colors.accent }} />
          </>
        )}
      </Button>
    </div>
  )
}
