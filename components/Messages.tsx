"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Search, MessageSquare, Pin, BellOff, Trash2, Check } from "lucide-react"
import { useMessages } from "@/contexts/messages-context"
import { useAuth } from "@/contexts/auth-context"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

export function Messages() {
  const {
    conversations,
    pinConversation,
    unpinConversation,
    muteConversation,
    unmuteConversation,
    deleteConversation,
    acceptMessageRequest,
    declineMessageRequest,
  } = useMessages()
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("primary")
  const [swipedConversationId, setSwipedConversationId] = useState<string | null>(null)
  const touchStartX = useRef<number | null>(null)

  // Filter conversations based on search query and tab
  const filteredConversations = conversations.filter((conversation) => {
    const matchesSearch = conversation.user.username.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTab = activeTab === "primary" ? !conversation.isRequest : conversation.isRequest
    return matchesSearch && matchesTab
  })

  // Sort conversations: pinned first, then by timestamp
  const sortedConversations = [...filteredConversations].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1
    if (!a.isPinned && b.isPinned) return 1

    // Handle null lastMessage safely
    const timestampA = a.lastMessage?.timestamp ? new Date(a.lastMessage.timestamp).getTime() : 0
    const timestampB = b.lastMessage?.timestamp ? new Date(b.lastMessage.timestamp).getTime() : 0

    return timestampB - timestampA
  })

  const handleTouchStart = (e: React.TouchEvent, conversationId: string) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchMove = (e: React.TouchEvent, conversationId: string) => {
    if (touchStartX.current === null) return

    const touchMoveX = e.touches[0].clientX
    const diff = touchStartX.current - touchMoveX

    // If swiped left more than 50px, show actions
    if (diff > 50) {
      setSwipedConversationId(conversationId)
    } else if (diff < -50) {
      // If swiped right, hide actions
      setSwipedConversationId(null)
    }
  }

  const handleTouchEnd = () => {
    touchStartX.current = null
  }

  const handlePin = (conversationId: string, isPinned: boolean) => {
    if (isPinned) {
      unpinConversation(conversationId)
    } else {
      pinConversation(conversationId)
    }
    setSwipedConversationId(null)
  }

  const handleMute = (conversationId: string, isMuted: boolean) => {
    if (isMuted) {
      unmuteConversation(conversationId)
    } else {
      muteConversation(conversationId)
    }
    setSwipedConversationId(null)
  }

  const handleDelete = (conversationId: string) => {
    deleteConversation(conversationId)
    setSwipedConversationId(null)
  }

  const handleAccept = (conversationId: string) => {
    acceptMessageRequest(conversationId)
    setSwipedConversationId(null)
  }

  const handleDecline = (conversationId: string) => {
    declineMessageRequest(conversationId)
    setSwipedConversationId(null)
  }

  // Count message requests
  const requestCount = conversations.filter((c) => c.isRequest && !c.initiatedByMe).length

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search messages..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Tabs defaultValue="primary" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="primary">Primary</TabsTrigger>
          <TabsTrigger value="requests">
            Requests
            {requestCount > 0 && (
              <span className="ml-1 bg-pink-500 text-white text-xs rounded-full px-2 py-0.5">{requestCount}</span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="primary" className="space-y-4 mt-4">
          {sortedConversations.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <MessageSquare className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                <p className="text-gray-500">No messages yet</p>
              </CardContent>
            </Card>
          ) : (
            sortedConversations.map((conversation) => (
              <div key={conversation.id} className="relative overflow-hidden">
                <motion.div
                  initial={{ x: 0 }}
                  animate={{ x: swipedConversationId === conversation.id ? -120 : 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  onTouchStart={(e) => handleTouchStart(e as any, conversation.id)}
                  onTouchMove={(e) => handleTouchMove(e as any, conversation.id)}
                  onTouchEnd={handleTouchEnd}
                  className="touch-pan-y"
                >
                  <Link href={`/messages/${conversation.id}`}>
                    <Card
                      className={`hover:bg-gray-50 transition-colors ${
                        !conversation.read ? "border-l-4 border-l-pink-500" : ""
                      } ${conversation.isPinned ? "bg-gray-50" : ""}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <Avatar>
                            <AvatarImage
                              src={conversation.user.avatar || "/placeholder.svg"}
                              alt={conversation.user.username}
                            />
                            <AvatarFallback>{conversation.user.username.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center">
                              <p className="font-medium truncate">
                                {conversation.user.username}
                                {conversation.isPinned && <Pin className="inline-block h-3 w-3 ml-1 text-gray-400" />}
                                {conversation.isMuted && (
                                  <BellOff className="inline-block h-3 w-3 ml-1 text-gray-400" />
                                )}
                              </p>
                              <span className="text-xs text-gray-500 flex-shrink-0">
                                {conversation.lastMessage?.timestamp
                                  ? formatDistanceToNow(new Date(conversation.lastMessage.timestamp), {
                                      addSuffix: true,
                                    })
                                  : "New conversation"}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 truncate">
                              {conversation.lastMessage
                                ? (conversation.lastMessage.senderId === user?.id ? "You: " : "") +
                                  conversation.lastMessage.content
                                : "Start a conversation"}
                            </p>
                          </div>
                          {!conversation.read && <div className="w-3 h-3 bg-pink-500 rounded-full flex-shrink-0"></div>}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>

                {/* Swipe actions */}
                <div className="absolute top-0 right-0 h-full flex items-center gap-1 pr-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 bg-gray-100 hover:bg-gray-200"
                    onClick={() => handlePin(conversation.id, conversation.isPinned)}
                  >
                    <Pin className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 bg-gray-100 hover:bg-gray-200"
                    onClick={() => handleMute(conversation.id, conversation.isMuted)}
                  >
                    <BellOff className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 bg-red-100 hover:bg-red-200 text-red-500"
                    onClick={() => handleDelete(conversation.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="requests" className="space-y-4 mt-4">
          {sortedConversations.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <MessageSquare className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                <p className="text-gray-500">No message requests</p>
              </CardContent>
            </Card>
          ) : (
            sortedConversations.map((conversation) => (
              <div key={conversation.id} className="relative overflow-hidden">
                <motion.div
                  initial={{ x: 0 }}
                  animate={{ x: swipedConversationId === conversation.id ? -120 : 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  onTouchStart={(e) => handleTouchStart(e as any, conversation.id)}
                  onTouchMove={(e) => handleTouchMove(e as any, conversation.id)}
                  onTouchEnd={handleTouchEnd}
                  className="touch-pan-y"
                >
                  <Card className="hover:bg-gray-50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage
                            src={conversation.user.avatar || "/placeholder.svg"}
                            alt={conversation.user.username}
                          />
                          <AvatarFallback>{conversation.user.username.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center">
                            <p className="font-medium truncate">{conversation.user.username}</p>
                            <span className="text-xs text-gray-500 flex-shrink-0">
                              {conversation.lastMessage?.timestamp
                                ? formatDistanceToNow(new Date(conversation.lastMessage.timestamp), {
                                    addSuffix: true,
                                  })
                                : "New request"}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 truncate">
                            {conversation.initiatedByMe
                              ? "You sent a message"
                              : conversation.lastMessage?.content || "Wants to send you a message"}
                          </p>

                          {/* Only show accept/decline buttons for requests not initiated by the current user */}
                          {!conversation.initiatedByMe && (
                            <div className="mt-2 flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs"
                                onClick={() => handleDecline(conversation.id)}
                              >
                                Delete
                              </Button>
                              <Button size="sm" className="text-xs" onClick={() => handleAccept(conversation.id)}>
                                Accept
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Swipe actions */}
                <div className="absolute top-0 right-0 h-full flex items-center gap-1 pr-2">
                  {!conversation.initiatedByMe && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 bg-green-100 hover:bg-green-200 text-green-500"
                      onClick={() => handleAccept(conversation.id)}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 bg-red-100 hover:bg-red-200 text-red-500"
                    onClick={() => handleDelete(conversation.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
