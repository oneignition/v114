"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { Home, Users, User, MessageSquare, Bell } from "lucide-react"
import { OrientationWarning } from "@/components/OrientationWarning"
import { NetworkStatus } from "@/components/NetworkStatus"
import { Notifications } from "@/components/Notifications"
import { useNotifications } from "@/contexts/notifications-context"
import { useAuth } from "@/contexts/auth-context"

export function MobileLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [showNotifications, setShowNotifications] = useState(false)
  const { unreadCount } = useNotifications()
  const { user } = useAuth()

  // Handle orientation change
  const [isLandscape, setIsLandscape] = useState(false)

  useEffect(() => {
    const checkOrientation = () => {
      setIsLandscape(window.innerWidth > window.innerHeight)
    }

    checkOrientation()
    window.addEventListener("resize", checkOrientation)
    return () => window.removeEventListener("resize", checkOrientation)
  }, [])

  const handleNotificationClick = (e) => {
    e.preventDefault()
    setShowNotifications(!showNotifications)
  }

  return (
    <div className="flex flex-col min-h-screen">
      <NetworkStatus />
      {isLandscape && <OrientationWarning />}

      <main className="flex-1 pb-16">{children}</main>

      {showNotifications && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setShowNotifications(false)}>
          <div
            className="absolute bottom-16 right-0 w-full max-w-md bg-white rounded-t-lg shadow-lg z-50 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4">
              <h2 className="text-xl font-bold mb-4">Notifications</h2>
              <Notifications fullPage={true} onClose={() => setShowNotifications(false)} />
            </div>
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30">
        <div className="flex justify-around items-center h-16">
          <Link
            href="/"
            className={`flex flex-col items-center ${pathname === "/" ? "text-pink-500" : "text-gray-500"}`}
          >
            <Home className="h-6 w-6" />
            <span className="text-xs mt-1">Home</span>
          </Link>

          <Link
            href="/community"
            className={`flex flex-col items-center ${pathname === "/community" ? "text-pink-500" : "text-gray-500"}`}
          >
            <Users className="h-6 w-6" />
            <span className="text-xs mt-1">Community</span>
          </Link>

          <Link href="/profile" className="flex flex-col items-center justify-center -mt-5 relative">
            <div
              className={`absolute -top-5 ${pathname === "/profile" ? "bg-pink-500" : "bg-gray-500"} rounded-full p-3 shadow-lg`}
            >
              <User className="h-6 w-6 text-white" />
            </div>
            <span className={`text-xs mt-6 ${pathname === "/profile" ? "text-pink-500" : "text-gray-500"}`}>
              {user ? "Profile" : "Sign In"}
            </span>
          </Link>

          {/* Removed Rankings tab */}

          <a
            href="#"
            onClick={handleNotificationClick}
            className={`flex flex-col items-center relative ${showNotifications ? "text-pink-500" : "text-gray-500"}`}
          >
            <Bell className="h-6 w-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
            <span className="text-xs mt-1">Alerts</span>
          </a>

          <Link
            href="/messages"
            className={`flex flex-col items-center ${pathname === "/messages" ? "text-pink-500" : "text-gray-500"}`}
          >
            <MessageSquare className="h-6 w-6" />
            <span className="text-xs mt-1">Messages</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}
