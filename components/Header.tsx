"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { FlowerIcon as Rose, Search, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CommunityFeedback } from "./CommunityFeedback"
import type { Theme } from "@/config/theme"
import { useAuth } from "@/contexts/auth-context"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useMobile } from "@/components/mobile/useMobile"
import { SettingsMenu } from "./SettingsMenu"
import { useRoses } from "@/contexts/rose-context"

interface HeaderProps {
  theme: Theme
}

export function Header({ theme }: HeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { user, logout } = useAuth()
  const router = useRouter()
  const { isMobile } = useMobile()
  const { roseCount } = useRoses()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically send the search query to your backend
    console.log("Searching for:", searchQuery)
    // For now, we'll just close the dialog
    setIsSearchOpen(false)
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  // If on mobile, the MobileLayout component will handle the header
  if (isMobile) {
    return null
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link className="mr-6 flex items-center space-x-2" href="/">
            <Rose className="h-6 w-6" style={{ color: theme.colors.accent }} />
            <span className="hidden font-bold sm:inline-block">Roses</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link href="/rankings">Rankings</Link>
            {/* Removed Community link */}
            <Link href="/world">World</Link>
            <Link href="/submit">Submit</Link>
            <Link href="/about">About</Link>
            <Link href="/influencers">Influencers</Link>
            <CommunityFeedback type="rules" />
          </nav>
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center">
          <Link className="flex items-center space-x-2" href="/">
            <Rose className="h-6 w-6" style={{ color: theme.colors.accent }} />
            <span className="font-bold">Roses</span>
          </Link>
          <Button variant="ghost" size="icon" className="ml-2" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="ml-auto">
                <Search className="mr-2 h-4 w-4" />
                Search
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Search Roses</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSearch} className="flex items-center space-x-2">
                <Input
                  placeholder="Search users, songs, artists..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button type="submit">Search</Button>
              </form>
            </DialogContent>
          </Dialog>
          <div className="flex items-center space-x-2">
            <Button variant="outline">
              <div className="flex items-center space-x-1">
                <Rose className="h-4 w-4" style={{ color: theme.colors.accent }} />
                <span className="text-sm font-medium">{roseCount}</span>
              </div>
            </Button>
            {user ? (
              <>
                <Link href="/profile">
                  <Button variant="ghost">{user.username}</Button>
                </Link>
                <SettingsMenu />
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link href="/signup">
                  <Button>Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link href="/rankings" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100">
              Rankings
            </Link>
            {/* Removed Community link from mobile menu too */}
            <Link href="/world" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100">
              World
            </Link>
            <Link href="/submit" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100">
              Submit
            </Link>
            <Link href="/about" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100">
              About
            </Link>
            <Link href="/influencers" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100">
              Influencers
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
