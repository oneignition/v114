"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronDown, ChevronUp } from "lucide-react"

interface Message {
  id: number
  sender: string
  content: string
  timestamp: string
  avatar: string
}

export function Chat() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, sender: "Alice", content: "Hey everyone!", timestamp: "2:30 PM", avatar: "/placeholder.svg" },
    { id: 2, sender: "Bob", content: "Hi Alice! How are you?", timestamp: "2:31 PM", avatar: "/placeholder.svg" },
    {
      id: 3,
      sender: "Charlie",
      content: "Excited for the new BTS album?",
      timestamp: "2:32 PM",
      avatar: "/placeholder.svg",
    },
  ])
  const [newMessage, setNewMessage] = useState("")
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollIntoView({ behavior: "smooth", block: "end" })
    }
  }, [messages]) //Corrected dependency

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (newMessage.trim()) {
      const newMsg: Message = {
        id: Date.now(),
        sender: "You",
        content: newMessage.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        avatar: "/placeholder.svg", // You can replace this with the current user's avatar
      }
      setMessages((prevMessages) => [...prevMessages, newMsg])
      setNewMessage("")
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen ? (
        <Card className="w-80 shadow-lg bg-gradient-to-r from-pink-100 to-purple-100">
          <CardHeader className="flex flex-row items-center justify-between p-4">
            <h3 className="font-semibold text-lg">World Chat</h3>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-4" ref={scrollAreaRef}>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === "You" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`flex items-start space-x-2 ${message.sender === "You" ? "flex-row-reverse space-x-reverse" : "flex-row"}`}
                    >
                      <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                        <Image
                          src={message.avatar || "/placeholder.svg"}
                          alt={message.sender}
                          width={32}
                          height={32}
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className={`text-sm font-semibold ${message.sender === "You" ? "text-right" : "text-left"}`}>
                          {message.sender}
                        </p>
                        <div className={`p-2 rounded-lg ${message.sender === "You" ? "bg-pink-300" : "bg-white"}`}>
                          <p className="text-sm">{message.content}</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{message.timestamp}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
          <CardFooter>
            <form onSubmit={handleSendMessage} className="flex w-full">
              <Input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-grow mr-2"
              />
              <Button type="submit">Send</Button>
            </form>
          </CardFooter>
        </Card>
      ) : (
        <Button
          onClick={() => setIsOpen(true)}
          className="bg-pink-400 hover:bg-pink-500 text-white rounded-full shadow-lg"
        >
          <ChevronUp className="h-4 w-4 mr-2" />
          World Chat
        </Button>
      )}
    </div>
  )
}
