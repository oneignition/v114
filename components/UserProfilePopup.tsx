"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageSquare, UserPlus, X, UserX, UserCheck } from "lucide-react"
import { useRouter } from "next/navigation"
import { useMessages } from "@/contexts/messages-context"
import { useNotifications } from "@/contexts/notifications-context"
import { useAuth } from "@/contexts/auth-context"

// Friend status types
type FriendStatus = "not_friend" | "request_sent" | "request_received" | "friends"

interface UserProfilePopupProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  username: string
  avatar: string
  bio?: string
  stats?: {
    posts?: number
    friends?: number
    roses?: number
  }
}

export function UserProfilePopup({
  isOpen,
  onClose,
  userId,
  username,
  avatar,
  bio = "K-pop enthusiast and music lover!",
  stats = { posts: 24, friends: 156, roses: 1250 },
}: UserProfilePopupProps) {
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
      onClose() // Close the popup first

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

  const handleViewFullProfile = () => {
    router.push(`/user/${userId}`)
    onClose()
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
    onClose()
  }

  const getFriendActionText = () => {
    switch (friendStatus) {
      case "not_friend":
        return "Add Friend"
      case "request_sent":
        return "Cancel Request"
      case "request_received":
        return "Accept Request"
      case "friends":
        return "Remove Friend"
    }
  }

  const getFriendActionIcon = () => {
    switch (friendStatus) {
      case "not_friend":
        return <UserPlus className="h-4 w-4 mr-2" />
      case "request_sent":
        return <UserX className="h-4 w-4 mr-2" />
      case "request_received":
        return <UserCheck className="h-4 w-4 mr-2" />
      case "friends":
        return <UserX className="h-4 w-4 mr-2" />
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-xl">
        <div className="relative">
          {/* Gradient background */}
          <div className="h-32 bg-gradient-to-r from-pink-400 to-purple-500"></div>

          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 text-white hover:bg-white/20"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>

          {/* Avatar */}
          <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
            <Avatar className="h-24 w-24 border-4 border-white">
              <AvatarImage src={avatar || "/placeholder.svg"} alt={username || "User"} />
              <AvatarFallback>{username ? username.substring(0, 2).toUpperCase() : "U"}</AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Profile content */}
        <div className="pt-14 px-6 pb-6 text-center">
          <h3 className="text-xl font-bold">{username}</h3>
          <p className="text-sm text-gray-500 mt-1">{bio}</p>

          {/* Stats */}
          <div className="flex justify-center gap-6 mt-4">
            <div className="text-center">
              <p className="font-bold">{stats.posts}</p>
              <p className="text-xs text-gray-500">Posts</p>
            </div>
            <div className="text-center">
              <p className="font-bold">{stats.friends}</p>
              <p className="text-xs text-gray-500">Friends</p>
            </div>
            <div className="text-center">
              <p className="font-bold">{stats.roses}</p>
              <p className="text-xs text-gray-500">Roses</p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 mt-6">
            <Button
              className="flex-1"
              variant={friendStatus === "friends" || friendStatus === "request_sent" ? "outline" : "default"}
              onClick={handleFriendAction}
            >
              {getFriendActionIcon()}
              {getFriendActionText()}
            </Button>
            <Button className="flex-1" variant="secondary" onClick={handleMessage} disabled={isCreatingConversation}>
              <MessageSquare className="h-4 w-4 mr-2" />
              {isCreatingConversation ? "Creating..." : "Message"}
            </Button>
          </div>

          <div className="mt-4 flex justify-between">
            <Button variant="link" className="text-sm" onClick={handleViewFullProfile}>
              View Full Profile
            </Button>
            <Button variant="link" className="text-sm text-red-500" onClick={handleBlockUser}>
              Block User
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
