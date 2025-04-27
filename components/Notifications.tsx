"use client"

import { useState } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useNotifications } from "@/contexts/notifications-context"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter } from "next/navigation"

interface NotificationsProps {
  fullPage?: boolean
  onClose?: () => void
}

export function Notifications({ fullPage = false, onClose }: NotificationsProps) {
  const { notifications, markAsRead, markAllAsRead, unreadCount } = useNotifications()
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const handleNotificationClick = (id: string, link: string) => {
    markAsRead(id)
    if (fullPage && onClose) {
      onClose()
    } else {
      setIsOpen(false)
    }
    router.push(link)
  }

  const getNotificationContent = (notification) => {
    switch (notification.type) {
      case "message":
        return (
          <span>
            <span className="font-semibold">{notification.sender.username}</span> sent you a message:{" "}
            <span className="text-gray-500">"{notification.content}"</span>
          </span>
        )
      case "friend_request":
        return (
          <span>
            <span className="font-semibold">{notification.sender.username}</span> sent you a friend request
          </span>
        )
      case "profile_view":
        return (
          <span>
            <span className="font-semibold">{notification.sender.username}</span> viewed your profile
          </span>
        )
      case "like":
        return (
          <span>
            <span className="font-semibold">{notification.sender.username}</span> {notification.content}
          </span>
        )
      case "comment":
        return (
          <span>
            <span className="font-semibold">{notification.sender.username}</span> {notification.content}
          </span>
        )
      case "reply":
        return (
          <span>
            <span className="font-semibold">{notification.sender.username}</span> {notification.content}
          </span>
        )
      case "rose_donation":
        return (
          <span>
            <span className="font-semibold">{notification.sender.username}</span> {notification.content}
          </span>
        )
      default:
        return (
          <span>
            <span className="font-semibold">{notification.sender.username}</span> interacted with you
          </span>
        )
    }
  }

  const getNotificationLink = (notification) => {
    switch (notification.type) {
      case "message":
        return `/messages/${notification.sender.id}`
      case "friend_request":
        return `/profile`
      case "profile_view":
        return `/profile`
      case "like":
      case "comment":
      case "reply":
      case "rose_donation":
        if (notification.postId?.startsWith("song-")) {
          return `/rankings`
        } else if (notification.postId?.startsWith("post-")) {
          return `/community`
        }
        return `/profile`
      default:
        return `/profile`
    }
  }

  const renderNotificationItem = (notification) => {
    const link = getNotificationLink(notification)

    return fullPage ? (
      <Card
        key={notification.id}
        className={`mb-3 ${notification.read ? "" : "border-l-4 border-pink-500"}`}
        onClick={() => handleNotificationClick(notification.id, link)}
      >
        <CardContent className="p-4">
          <div className="flex items-start">
            <Avatar className="h-10 w-10 mr-3 flex-shrink-0">
              <AvatarImage src={notification.sender.avatar || "/placeholder.svg"} />
              <AvatarFallback>{notification.sender.username.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <p>{getNotificationContent(notification)}</p>
              <p className="text-xs text-gray-500">
                {new Date(notification.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                · {new Date(notification.timestamp).toLocaleDateString()}
              </p>
            </div>
            {!notification.read && <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>}
          </div>
        </CardContent>
      </Card>
    ) : (
      <DropdownMenuItem
        key={notification.id}
        className={`flex items-start p-3 ${notification.read ? "" : "bg-gray-50"}`}
        onClick={() => handleNotificationClick(notification.id, link)}
      >
        <Avatar className="h-8 w-8 mr-3 flex-shrink-0">
          <AvatarImage src={notification.sender.avatar || "/placeholder.svg"} />
          <AvatarFallback>{notification.sender.username.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-1">
          <p className="text-sm">{getNotificationContent(notification)}</p>
          <p className="text-xs text-gray-500">
            {new Date(notification.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}{" "}
            · {new Date(notification.timestamp).toLocaleDateString()}
          </p>
        </div>
        {!notification.read && <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>}
      </DropdownMenuItem>
    )
  }

  if (fullPage) {
    return (
      <div className="space-y-2">
        {unreadCount > 0 && (
          <div className="flex justify-end mb-4">
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              Mark all as read
            </Button>
          </div>
        )}

        {notifications.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <Bell className="mx-auto h-12 w-12 text-gray-300 mb-3" />
              <p className="text-gray-500">No notifications yet</p>
            </CardContent>
          </Card>
        ) : (
          notifications.map(renderNotificationItem)
        )}
      </div>
    )
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full"
              variant="destructive"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex justify-between items-center">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <DropdownMenuItem className="text-center py-4 text-gray-500">No notifications</DropdownMenuItem>
        ) : (
          notifications.map(renderNotificationItem)
        )}
        <DropdownMenuSeparator />
        <Link href="/notifications">
          <DropdownMenuItem className="text-center text-blue-500">View all notifications</DropdownMenuItem>
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
