"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface User {
  id: string
  username: string
  avatar: string
}

interface Notification {
  id: string
  type: "message" | "friend_request" | "profile_view" | "like" | "comment" | "reply" | "rose_donation"
  sender: User
  content?: string
  timestamp: string
  read: boolean
  postId?: string
  commentId?: string
  roseAmount?: number
}

interface NotificationsContextType {
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, "id" | "timestamp" | "read">) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  unreadCount: number
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined)

// Sample notifications with expanded types
const sampleNotifications: Notification[] = [
  {
    id: "1",
    type: "message",
    sender: {
      id: "2",
      username: "kpopfan1",
      avatar: "/placeholder.svg",
    },
    content: "Hey! I loved your profile. Are you going to the BTS concert?",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    read: false,
  },
  {
    id: "2",
    type: "friend_request",
    sender: {
      id: "3",
      username: "straykidslover",
      avatar: "/placeholder.svg",
    },
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    read: false,
  },
  {
    id: "3",
    type: "profile_view",
    sender: {
      id: "4",
      username: "musiclover",
      avatar: "/placeholder.svg",
    },
    timestamp: new Date(Date.now() - 172800000).toISOString(),
    read: true,
  },
  {
    id: "4",
    type: "like",
    sender: {
      id: "5",
      username: "btsarmy",
      avatar: "/placeholder.svg",
    },
    content: "liked your comment on 'Dynamite'",
    postId: "song-123",
    commentId: "comment-456",
    timestamp: new Date(Date.now() - 43200000).toISOString(),
    read: false,
  },
  {
    id: "5",
    type: "comment",
    sender: {
      id: "6",
      username: "blackpinkblink",
      avatar: "/placeholder.svg",
    },
    content: "commented on your post: 'I totally agree with you about the choreography!'",
    postId: "post-789",
    timestamp: new Date(Date.now() - 21600000).toISOString(),
    read: false,
  },
  {
    id: "6",
    type: "reply",
    sender: {
      id: "7",
      username: "twicefan",
      avatar: "/placeholder.svg",
    },
    content: "replied to your comment: 'Yes, their new album is amazing!'",
    postId: "post-101",
    commentId: "comment-202",
    timestamp: new Date(Date.now() - 10800000).toISOString(),
    read: false,
  },
  {
    id: "7",
    type: "rose_donation",
    sender: {
      id: "8",
      username: "kpoplover",
      avatar: "/placeholder.svg",
    },
    content: "sent you 50 roses for your comment on 'How You Like That'",
    roseAmount: 50,
    postId: "song-303",
    commentId: "comment-404",
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    read: false,
  },
]

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>(sampleNotifications)

  const addNotification = (notification: Omit<Notification, "id" | "timestamp" | "read">) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      read: false,
    }

    setNotifications((prev) => [newNotification, ...prev])
  }

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        addNotification,
        markAsRead,
        markAllAsRead,
        unreadCount,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationsContext)
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationsProvider")
  }
  return context
}
