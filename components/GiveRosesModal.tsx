"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Flower } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { getUserRoses, giveRoses } from "@/actions/rose-actions"
import { useToast } from "@/components/ui/use-toast"
import { useRoses } from "@/contexts/rose-context"

interface Recipient {
  id: string
  username: string
  avatar?: string
}

interface GiveRosesModalProps {
  isOpen: boolean
  onClose: () => void
  recipient: Recipient
  songId?: string
  songName?: string
}

export function GiveRosesModal({ isOpen, onClose, recipient, songId, songName }: GiveRosesModalProps) {
  const { user } = useAuth()
  const [userRoses, setUserRoses] = useState(0)
  const [roseAmount, setRoseAmount] = useState(1)
  const [isGivingAll, setIsGivingAll] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const { toast } = useToast()
  const { roseCount, updateRoseCount } = useRoses()

  // Fetch user roses when modal opens
  useEffect(() => {
    if (isOpen) {
      const fetchRoses = async () => {
        const roses = await getUserRoses()
        setUserRoses(roses)
      }

      fetchRoses()
      setRoseAmount(1)
      setIsGivingAll(false)
      setIsSubmitting(false)
      setSuccess(false)
    }
  }, [isOpen])

  const handleGiveRoses = async () => {
    if (!user) return

    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("amount", roseAmount.toString())
      formData.append("recipientId", songId || recipient.id)
      formData.append("recipientType", songId ? "song" : "user")

      const result = await giveRoses(formData)

      if (result.success) {
        updateRoseCount(result.newUserRoses)
        onClose()
        toast({
          title: "Success!",
          description: result.message,
        })
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error giving roses:", error)
      toast({
        title: "Error",
        description: "Failed to give roses. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSliderChange = (value: number[]) => {
    setRoseAmount(value[0])
    setIsGivingAll(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value)
    if (!isNaN(value) && value >= 0 && value <= userRoses) {
      setRoseAmount(value)
      setIsGivingAll(false)
    }
  }

  const handleGiveAll = () => {
    setRoseAmount(userRoses)
    setIsGivingAll(true)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            Give Roses {songName ? `to "${songName}"` : `to ${recipient.username}`}
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {success ? (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="bg-pink-100 p-3 rounded-full">
                  <Flower className="h-8 w-8 text-pink-500" />
                </div>
              </div>
              <p className="text-lg font-medium">
                You gave {isGivingAll ? "all" : roseAmount} roses{" "}
                {songName ? `to "${songName}"` : `to ${recipient.username}`}!
              </p>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-6">
                <p className="text-sm text-gray-500">Your roses:</p>
                <p className="font-medium flex items-center">
                  <Flower className="h-4 w-4 mr-1 text-pink-500" />
                  {userRoses.toLocaleString()}
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Amount of roses to give:</label>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Slider
                        value={[roseAmount]}
                        min={1}
                        max={userRoses}
                        step={1}
                        onValueChange={handleSliderChange}
                        disabled={isSubmitting || userRoses === 0}
                      />
                    </div>
                    <Input
                      type="number"
                      value={roseAmount}
                      onChange={handleInputChange}
                      className="w-20"
                      min={1}
                      max={userRoses}
                      disabled={isSubmitting || userRoses === 0}
                    />
                  </div>
                </div>

                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    onClick={handleGiveAll}
                    disabled={userRoses === 0 || isSubmitting}
                    className="border-pink-500 text-pink-500 hover:bg-pink-50"
                  >
                    Give All Roses
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          {!success && (
            <>
              <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                onClick={handleGiveRoses}
                disabled={roseAmount <= 0 || isSubmitting || userRoses === 0}
                className="bg-pink-500 hover:bg-pink-600"
              >
                {isSubmitting ? "Giving..." : `Give ${isGivingAll ? "All" : roseAmount} Roses`}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
