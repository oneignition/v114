"use client"

import type React from "react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MessageSquare, UserPlus, MoreVertical, User, UserX, UserCheck, ShieldAlert } from "lucide-react"
import { useRouter } from "next/navigation"
import { useMessages } from "@/contexts/messages-context"
import { useNotifications } from "@/contexts/notifications-context"
import { useAuth } from "@/contexts/auth-context"
import { useState, useEffect } from "react"

interface UserActionsProps {
  userId: string
  username: string
  avatar: string
  trigger?: React.ReactNode
}

// Friend status types
type FriendStatus = "not_friend" | "request_sent" | "request_received" | "friends"

export function UserActions({ userId, username, avatar, trigger }: UserActionsProps) {
  const router = useRouter()
  const { startConversation, ensureConversationExists } = useMessages()
  const { addNotification } = useNotifications()
  const { user, getFriendStatus, sendFriendRequest, acceptFriendRequest, removeFriend, blockUser } = useAuth()
  const [friendStatus, setFriendStatus] = useState<FriendStatus>("not_friend")
  const [isCreatingConversation, setIsCreatingConversation] = useState(false)

  // Get initial friend status
  useEffect(() => {
    if (user && userId) {
      const status = getFriendStatus(userId)
      setFriendStatus(status)
    }
  }, [user, userId, getFriendStatus])

  const handleMessage = async () => {
    if (!user) {
      router.push("/login")
      return
    }

    // Prevent multiple clicks
    if (isCreatingConversation) return
    setIsCreatingConversation(true)

    // Start a conversation
    const conversationId = startConversation({
      id: userId,
      username: username || `user${userId}`,
      avatar: avatar || "/placeholder.svg",
    })

    if (conversationId) {
      // Check if the conversation exists in our state
      const maxRetries = 5
      let retryCount = 0

      const checkAndNavigate = () => {
        if (ensureConversationExists(conversationId)) {
          router.push(`/messages/${conversationId}`)
          setIsCreatingConversation(false)
        } else if (retryCount < maxRetries) {
          retryCount++
          setTimeout(checkAndNavigate, 100)
        } else {
          // If we've tried too many times, just navigate anyway
          router.push(`/messages/${conversationId}`)
          setIsCreatingConversation(false)
        }
      }

      checkAndNavigate()
    } else {
      setIsCreatingConversation(false)
    }
  }

  const handleFriendAction = () => {
    if (!user) {
      router.push("/login")
      return
    }

    switch (friendStatus) {
      case "not_friend":
        sendFriendRequest(userId)
        setFriendStatus("request_sent")
        addNotification({
          type: "friend_request",
          sender: {
            id: userId,
            username,
            avatar,
          },
          content: `You sent a friend request to ${username}`,
        })
        break
      case "request_sent":
        // Cancel request
        removeFriend(userId)
        setFriendStatus("not_friend")
        addNotification({
          type: "friend_request",
          sender: {
            id: userId,
            username,
            avatar,
          },
          content: `You canceled your friend request to ${username}`,
        })
        break
      case "request_received":
        // Accept request
        acceptFriendRequest(userId)
        setFriendStatus("friends")
        addNotification({
          type: "friend_request",
          sender: {
            id: userId,
            username,
            avatar,
          },
          content: `You accepted ${username}'s friend request`,
        })
        break
      case "friends":
        // Remove friend
        removeFriend(userId)
        setFriendStatus("not_friend")
        addNotification({
          type: "friend_request",
          sender: {
            id: userId,
            username,
            avatar,
          },
          content: `You removed ${username} from your friends`,
        })
        break
    }
  }

  const handleViewProfile = () => {
    router.push(`/user/${userId}`)
  }

  const handleBlockUser = () => {
    if (!user) {
      router.push("/login")
      return
    }

    blockUser(userId)
    addNotification({
      type: "system",
      content: `You blocked ${username}`,
    })
  }

  const getFriendActionText = () => {
    switch (friendStatus) {
      case "not_friend":
        return (
          <>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Friend
          </>
        )
      case "request_sent":
        return (
          <>
            <UserX className="h-4 w-4 mr-2" />
            Cancel Request
          </>
        )
      case "request_received":
        return (
          <>
            <UserCheck className="h-4 w-4 mr-2" />
            Accept Request
          </>
        )
      case "friends":
        return (
          <>
            <UserX className="h-4 w-4 mr-2" />
            Remove Friend
          </>
        )
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleMessage} disabled={isCreatingConversation}>
          <MessageSquare className="h-4 w-4 mr-2" />
          {isCreatingConversation ? "Creating..." : "Message"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleFriendAction}>{getFriendActionText()}</DropdownMenuItem>
        <DropdownMenuItem onClick={handleViewProfile}>
          <User className="h-4 w-4 mr-2" />
          View Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleBlockUser} className="text-red-500">
          <ShieldAlert className="h-4 w-4 mr-2" />
          Block User
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
