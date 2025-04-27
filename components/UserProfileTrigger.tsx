"use client"

import type React from "react"

import { useState } from "react"
import { UserProfilePopup } from "./UserProfilePopup"

interface User {
  id: string
  username: string
  avatar: string
  bio?: string
  stats?: {
    posts?: number
    friends?: number
    roses?: number
  }
}

interface UserProfileTriggerProps {
  user: User
  children: React.ReactNode
}

export function UserProfileTrigger({ user, children }: UserProfileTriggerProps) {
  const [isPopupOpen, setIsPopupOpen] = useState(false)

  const handleOpenPopup = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsPopupOpen(true)
  }

  return (
    <>
      <div onClick={handleOpenPopup} className="cursor-pointer">
        {children}
      </div>

      <UserProfilePopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        userId={user.id}
        username={user.username || "User"}
        avatar={user.avatar || "/placeholder.svg"}
        bio={user.bio}
        stats={user.stats}
      />
    </>
  )
}
