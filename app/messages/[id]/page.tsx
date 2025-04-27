"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Header } from "@/components/Header"
import { theme } from "@/config/theme"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useMessages } from "@/contexts/messages-context"
import { useAuth } from "@/contexts/auth-context"
import { formatDistanceToNow } from "date-fns"
import { ArrowLeft, Send, Info } from "lucide-react"
import { MobileLayout } from "@/components/mobile/MobileLayout"
import { UserProfileTrigger } from "@/components/UserProfileTrigger"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function MessageConversationPage() {
  const { id } = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { conversations, getConversation, sendMessage, markAsRead, acceptMessageRequest, declineMessageRequest } =
    useMessages()
  const [newMessage, setNewMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [retryCount, setRetryCount] = useState(0)
  const maxRetries = 3

  // Get the conversation directly from the conversations array
  const conversationId = Array.isArray(id) ? id[0] : (id as string)
  const conversation = getConversation(conversationId)

  // Try to find the conversation with retries
  useEffect(() => {
    if (!conversation && retryCount < maxRetries) {
      const timer = setTimeout(() => {
        setRetryCount((prev) => prev + 1)
      }, 300) // Retry after 300ms

      return () => clearTimeout(timer)
    } else {
      setIsLoading(false)
    }
  }, [conversation, retryCount])

  // Mark conversation as read when opened
  useEffect(() => {
    if (conversation && !conversation.read) {
      markAsRead(conversation.id)
    }
  }, [conversation, markAsRead])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [conversation?.messages])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !conversation) return

    sendMessage(conversation.id, newMessage)
    setNewMessage("")
  }

  const handleBack = () => {
    router.push("/messages")
  }

  const handleAccept = () => {
    if (conversation) {
      acceptMessageRequest(conversation.id)
    }
  }

  const handleDecline = () => {
    if (conversation) {
      declineMessageRequest(conversation.id)
      router.push("/messages")
    }
  }

  if (!user) {
    return (
      <MobileLayout>
        <div style={{ backgroundColor: theme.colors.background }} className="min-h-screen">
          <Header theme={theme} />
          <main className="container mx-auto p-4 flex flex-col justify-center items-center">
            <p>Please log in to view messages</p>
            <Button className="mt-4" onClick={() => router.push("/login")}>
              Log In
            </Button>
          </main>
        </div>
      </MobileLayout>
    )
  }

  // Show loading state while trying to find the conversation
  if (isLoading) {
    return (
      <MobileLayout>
        <div style={{ backgroundColor: theme.colors.background }} className="min-h-screen">
          <Header theme={theme} />
          <main className="container mx-auto p-4 flex flex-col justify-center items-center">
            <p>Loading conversation...</p>
          </main>
        </div>
      </MobileLayout>
    )
  }

  // If conversation doesn't exist after retries, show error
  if (!conversation) {
    return (
      <MobileLayout>
        <div style={{ backgroundColor: theme.colors.background }} className="min-h-screen">
          <Header theme={theme} />
          <main className="container mx-auto p-4 flex flex-col justify-center items-center">
            <p>Conversation not found</p>
            <Button className="mt-4" onClick={() => router.push("/messages")}>
              Back to Messages
            </Button>
          </main>
        </div>
      </MobileLayout>
    )
  }

  // Ensure user object exists
  const otherUser = conversation.user || { id: "", username: "User", avatar: "/placeholder.svg" }
  const username = otherUser.username || "User"
  const avatar = otherUser.avatar || "/placeholder.svg"
  const userInitial = username && username.length > 0 ? username.charAt(0).toUpperCase() : "U"

  // Determine if the user can send messages
  // In Instagram's DM flow, the sender can always send messages
  // The recipient will see them in the "Requests" tab until they accept
  const canSendMessage = true

  return (
    <MobileLayout>
      <div style={{ backgroundColor: theme.colors.background }} className="min-h-screen flex flex-col">
        <div className="bg-white border-b sticky top-0 z-10">
          <div className="container mx-auto p-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Button variant="ghost" size="icon" onClick={handleBack} className="mr-2">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <UserProfileTrigger
                  user={{
                    id: otherUser.id,
                    username,
                    avatar,
                  }}
                >
                  <div className="flex items-center cursor-pointer">
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarImage src={avatar || "/placeholder.svg"} alt={username} />
                      <AvatarFallback>{userInitial}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{username}</p>
                      <p className="text-xs text-gray-500">
                        {conversation.isRequest && !conversation.initiatedByMe ? "Message request" : "Active now"}
                      </p>
                    </div>
                  </div>
                </UserProfileTrigger>
              </div>
              <div className="flex items-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Info className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>View profile</DropdownMenuItem>
                    <DropdownMenuItem>Mute messages</DropdownMenuItem>
                    <DropdownMenuItem>Block user</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-500">Delete conversation</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>

        <main className="container mx-auto p-4 flex-1 overflow-y-auto">
          {/* Show message request banner only if it's a request not initiated by the current user */}
          {conversation.isRequest && !conversation.initiatedByMe && (
            <div className="bg-gray-100 rounded-lg p-4 mb-4 text-center">
              <p className="text-sm mb-2">{username} wants to send you a message. Would you like to accept?</p>
              <div className="flex justify-center gap-2">
                <Button variant="outline" size="sm" onClick={handleDecline}>
                  Delete
                </Button>
                <Button size="sm" onClick={handleAccept}>
                  Accept
                </Button>
              </div>
            </div>
          )}

          {/* Show pending request banner if the current user initiated the request */}
          {conversation.isRequest && conversation.initiatedByMe && (
            <div className="bg-gray-100 rounded-lg p-4 mb-4 text-center">
              <p className="text-sm">
                You sent a message request to {username}. They'll see your message when they accept it.
              </p>
            </div>
          )}

          <div className="space-y-4">
            {conversation.messages && conversation.messages.length > 0 ? (
              conversation.messages.map((message) => {
                const isCurrentUser = message.senderId === user.id
                return (
                  <div key={message.id} className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                    {!isCurrentUser && (
                      <Avatar className="h-8 w-8 mr-2 self-end">
                        <AvatarImage src={avatar || "/placeholder.svg"} alt={username} />
                        <AvatarFallback>{userInitial}</AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`max-w-[70%] p-3 rounded-2xl ${
                        isCurrentUser
                          ? "bg-pink-500 text-white rounded-br-none"
                          : "bg-gray-200 text-gray-800 rounded-bl-none"
                      }`}
                    >
                      <p>{message.content}</p>
                      <p className={`text-xs mt-1 ${isCurrentUser ? "text-pink-100" : "text-gray-500"}`}>
                        {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="text-center text-gray-500 py-8">
                {conversation.initiatedByMe ? <p>Start a conversation with {username}</p> : <p>No messages yet</p>}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </main>

        <div className="bg-white border-t p-2 sticky bottom-0">
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <Input
              placeholder="Message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="rounded-full"
              disabled={!canSendMessage}
            />
            <Button type="submit" size="icon" disabled={!newMessage.trim() || !canSendMessage}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </MobileLayout>
  )
}
