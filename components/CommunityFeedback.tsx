"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface CommunityFeedbackProps {
  type: "community" | "rules"
}

export function CommunityFeedback({ type }: CommunityFeedbackProps) {
  const [isOpen, setIsOpen] = useState(false)

  const content =
    type === "community"
      ? {
          title: "Join Our Community! 🌟",
          description:
            "We're always looking for awesome ideas and feedback! If you have any suggestions, let us know and we'll try our best to make them happen! 💖",
        }
      : {
          title: "Please Read Our Rules 📜",
          description:
            "To ensure a positive experience for everyone, please familiarize yourself with our community guidelines.",
        }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost">{type === "community" ? "Community" : "Rules"}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-500">
            {content.title}
          </DialogTitle>
          <DialogDescription className="text-center">
            <p className="mb-4">{content.description}</p>
            <div className="flex justify-center space-x-2">
              <span role="img" aria-label="Microphone">
                🎤
              </span>
              <span role="img" aria-label="Sparkles">
                ✨
              </span>
              <span role="img" aria-label="Lightbulb">
                💡
              </span>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
