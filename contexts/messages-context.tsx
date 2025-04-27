"use client"

import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from "react"
import { useAuth } from "./auth-context"
import { useNotifications } from "./notifications-context"

interface User {
  id: string
  username: string
  avatar: string
}

interface Message {
  id: string
  conversationId: string
  senderId: string
  content: string
  timestamp: string
  read: boolean
}

interface Conversation {
  id: string
  user: User
  messages: Message[]
  lastMessage: Message | null
  read: boolean
  isPinned: boolean
  isMuted: boolean
  isRequest: boolean
  initiatedByMe: boolean // Track who initiated the conversation
}

interface MessagesContextType {
  conversations: Conversation[]
  getConversation: (id: string) => Conversation | undefined
  sendMessage: (conversationId: string, content: string) => void
  startConversation: (user: User) => string
  markAsRead: (conversationId: string) => void
  pinConversation: (conversationId: string) => void
  unpinConversation: (conversationId: string) => void
  muteConversation: (conversationId: string) => void
  unmuteConversation: (conversationId: string) => void
  deleteConversation: (conversationId: string) => void
  acceptMessageRequest: (conversationId: string) => void
  declineMessageRequest: (conversationId: string) => void
  ensureConversationExists: (id: string) => boolean
}

const MessagesContext = createContext<MessagesContextType | undefined>(undefined)

// Sample data
const sampleConversations: Conversation[] = [
  {
    id: "1",
    user: {
      id: "user5",
      username: "kpopfan1",
      avatar: "/placeholder.svg",
    },
    messages: [
      {
        id: "1",
        conversationId: "1",
        senderId: "user5",
        content: "Hey! I loved your profile. Are you going to the BTS concert?",
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        read: true,
      },
      {
        id: "2",
        conversationId: "1",
        senderId: "user123", // Current user
        content: "Thanks! Yes, I got tickets for the Saturday show!",
        timestamp: new Date(Date.now() - 3500000).toISOString(),
        read: true,
      },
      {
        id: "3",
        conversationId: "1",
        senderId: "user5",
        content: "That's awesome! Maybe we can meet up there?",
        timestamp: new Date(Date.now() - 3400000).toISOString(),
        read: true,
      },
    ],
    lastMessage: null, // This will be set in useEffect
    read: true,
    isPinned: false,
    isMuted: false,
    isRequest: false,
    initiatedByMe: false,
  },
  {
    id: "2",
    user: {
      id: "user6",
      username: "straykidslover",
      avatar: "/placeholder.svg",
    },
    messages: [
      {
        id: "4",
        conversationId: "2",
        senderId: "user6",
        content: "Hi! I saw you commented on the new Stray Kids song. What did you think of the album?",
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        read: false,
      },
    ],
    lastMessage: null, // This will be set in useEffect
    read: false,
    isPinned: true,
    isMuted: false,
    isRequest: false,
    initiatedByMe: false,
  },
  {
    id: "3",
    user: {
      id: "user7",
      username: "newkpopfan",
      avatar: "/placeholder.svg",
    },
    messages: [
      {
        id: "5",
        conversationId: "3",
        senderId: "user7",
        content: "Hello! I'm new to K-pop and saw you're a big fan. Any recommendations for a beginner?",
        timestamp: new Date(Date.now() - 172800000).toISOString(),
        read: true,
      },
    ],
    lastMessage: null, // This will be set in useEffect
    read: true,
    isPinned: false,
    isMuted: true,
    isRequest: true,
    initiatedByMe: false,
  },
]

// Use localStorage to persist newly created conversations
const TEMP_CONVERSATIONS_KEY = "temp_conversations"

export function MessagesProvider({ children }: { children: ReactNode }) {
  const { user, isBlocked, isFollowing, isFollower } = useAuth()
  const { addNotification } = useNotifications()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [initialized, setInitialized] = useState(false)
  const conversationsRef = useRef<Conversation[]>([])

  // Keep a ref to the current conversations for synchronous access
  useEffect(() => {
    conversationsRef.current = conversations
  }, [conversations])

  // Initialize conversations and set lastMessage
  useEffect(() => {
    // First, load sample conversations
    const initializedConversations = sampleConversations.map((conv) => {
      return {
        ...conv,
        lastMessage: conv.messages.length > 0 ? conv.messages[conv.messages.length - 1] : null,
      }
    })

    // Then, check if there are any temporary conversations in localStorage
    try {
      const tempConversationsJson = localStorage.getItem(TEMP_CONVERSATIONS_KEY)
      if (tempConversationsJson) {
        const tempConversations = JSON.parse(tempConversationsJson)
        // Merge with sample conversations, avoiding duplicates
        const mergedConversations = [...initializedConversations]

        tempConversations.forEach((tempConv: Conversation) => {
          if (!mergedConversations.some((conv) => conv.id === tempConv.id)) {
            mergedConversations.push(tempConv)
          }
        })

        setConversations(mergedConversations)
        conversationsRef.current = mergedConversations
        // Clear the temporary storage after loading
        localStorage.removeItem(TEMP_CONVERSATIONS_KEY)
      } else {
        setConversations(initializedConversations)
        conversationsRef.current = initializedConversations
      }
    } catch (error) {
      console.error("Error loading temporary conversations:", error)
      setConversations(initializedConversations)
      conversationsRef.current = initializedConversations
    }

    setInitialized(true)
  }, [])

  // Memoize getConversation to avoid unnecessary re-renders
  const getConversation = useCallback(
    (id: string) => {
      return conversations.find((conv) => conv.id === id)
    },
    [conversations],
  )

  // Function to ensure a conversation exists
  const ensureConversationExists = useCallback((id: string) => {
    // Use the ref for synchronous access
    return conversationsRef.current.some((conv) => conv.id === id)
  }, [])

  const sendMessage = (conversationId: string, content: string) => {
    if (!user) return

    setConversations((prevConversations) => {
      return prevConversations.map((conv) => {
        if (conv.id === conversationId) {
          const newMessage = {
            id: Date.now().toString(),
            conversationId,
            senderId: user.id,
            content,
            timestamp: new Date().toISOString(),
            read: false,
          }

          const updatedMessages = [...conv.messages, newMessage]

          return {
            ...conv,
            messages: updatedMessages,
            lastMessage: newMessage,
          }
        }
        return conv
      })
    })
  }

  const startConversation = (otherUser: User) => {
    if (!user) return ""

    // Don't allow conversations with blocked users
    if (isBlocked && isBlocked(otherUser.id)) return ""

    // Check if conversation already exists
    const existingConv = conversationsRef.current.find((conv) => conv.user.id === otherUser.id)
    if (existingConv) return existingConv.id

    // Create new conversation
    const newConvId = Date.now().toString()

    // Determine if this should be a request based on Instagram's rules:
    // If the recipient follows the sender, it goes directly to inbox
    // If the recipient doesn't follow the sender, it goes to requests
    const recipientFollowsSender = isFollower ? isFollower(otherUser.id) : false
    const isRequest = !recipientFollowsSender

    const newConversation: Conversation = {
      id: newConvId,
      user: otherUser,
      messages: [],
      lastMessage: null,
      read: true,
      isPinned: false,
      isMuted: false,
      isRequest,
      initiatedByMe: true, // This conversation was initiated by the current user
    }

    // Add the new conversation to state immediately
    setConversations((prev) => {
      const updated = [...prev, newConversation]
      conversationsRef.current = updated
      return updated
    })

    // Also store in localStorage as a backup
    try {
      const existingTempConvsJson = localStorage.getItem(TEMP_CONVERSATIONS_KEY)
      const existingTempConvs = existingTempConvsJson ? JSON.parse(existingTempConvsJson) : []
      const updatedTempConvs = [...existingTempConvs, newConversation]
      localStorage.setItem(TEMP_CONVERSATIONS_KEY, JSON.stringify(updatedTempConvs))
    } catch (error) {
      console.error("Error saving temporary conversation:", error)
    }

    // Return the conversation ID
    return newConvId
  }

  const markAsRead = (conversationId: string) => {
    setConversations((prevConversations) => {
      return prevConversations.map((conv) => {
        if (conv.id === conversationId) {
          return {
            ...conv,
            read: true,
            messages: conv.messages.map((msg) => ({
              ...msg,
              read: true,
            })),
          }
        }
        return conv
      })
    })
  }

  const pinConversation = (conversationId: string) => {
    setConversations((prevConversations) => {
      return prevConversations.map((conv) => {
        if (conv.id === conversationId) {
          return {
            ...conv,
            isPinned: true,
          }
        }
        return conv
      })
    })
  }

  const unpinConversation = (conversationId: string) => {
    setConversations((prevConversations) => {
      return prevConversations.map((conv) => {
        if (conv.id === conversationId) {
          return {
            ...conv,
            isPinned: false,
          }
        }
        return conv
      })
    })
  }

  const muteConversation = (conversationId: string) => {
    setConversations((prevConversations) => {
      return prevConversations.map((conv) => {
        if (conv.id === conversationId) {
          return {
            ...conv,
            isMuted: true,
          }
        }
        return conv
      })
    })
  }

  const unmuteConversation = (conversationId: string) => {
    setConversations((prevConversations) => {
      return prevConversations.map((conv) => {
        if (conv.id === conversationId) {
          return {
            ...conv,
            isMuted: false,
          }
        }
        return conv
      })
    })
  }

  const deleteConversation = (conversationId: string) => {
    setConversations((prevConversations) => {
      return prevConversations.filter((conv) => conv.id !== conversationId)
    })
  }

  const acceptMessageRequest = (conversationId: string) => {
    setConversations((prevConversations) => {
      return prevConversations.map((conv) => {
        if (conv.id === conversationId) {
          return {
            ...conv,
            isRequest: false,
          }
        }
        return conv
      })
    })
  }

  const declineMessageRequest = (conversationId: string) => {
    deleteConversation(conversationId)
  }

  // Don't render children until we've initialized
  if (!initialized) {
    return null
  }

  return (
    <MessagesContext.Provider
      value={{
        conversations,
        getConversation,
        sendMessage,
        startConversation,
        markAsRead,
        pinConversation,
        unpinConversation,
        muteConversation,
        unmuteConversation,
        deleteConversation,
        acceptMessageRequest,
        declineMessageRequest,
        ensureConversationExists,
      }}
    >
      {children}
    </MessagesContext.Provider>
  )
}

export function useMessages() {
  const context = useContext(MessagesContext)
  if (context === undefined) {
    throw new Error("useMessages must be used within a MessagesProvider")
  }
  return context
}
