"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface User {
  id: string
  username: string
  email: string
  avatar?: string
  bio?: string
  roses: number
  friends?: string[]
  following?: string[] // Users this user follows
  followers?: string[] // Users following this user
  blocked?: string[]
  friendRequests?: {
    sent: string[]
    received: string[]
  }
  profileVisibility?: {
    showVisitors: boolean
  }
}

type FriendStatus = "not_friend" | "request_sent" | "request_received" | "friends"

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  signup: (email: string, password: string, username: string) => Promise<{ success: boolean; message: string }>
  updateProfile: (data: Partial<User>) => void
  checkUsernameAvailability: (username: string) => Promise<boolean>
  getFriendStatus: (userId: string) => FriendStatus
  sendFriendRequest: (userId: string) => void
  acceptFriendRequest: (userId: string) => void
  removeFriend: (userId: string) => void
  blockUser: (userId: string) => void
  unblockUser: (userId: string) => void
  isBlocked: (userId: string) => boolean
  isFollowing: (userId: string) => boolean
  isFollower: (userId: string) => boolean
  followUser: (userId: string) => void
  unfollowUser: (userId: string) => void
  isLoading: boolean
  updateUser: (data: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock user database for development
const mockUsers = [
  {
    id: "user123",
    username: "kpoplover",
    email: "user@example.com",
    password: "password123", // In a real app, this would be hashed
    avatar: "/placeholder.svg",
    bio: "K-pop enthusiast and music lover!",
    roses: 250,
    friends: ["user5"],
    following: ["user5", "user6"], // Following these users
    followers: ["user5", "user7"], // These users follow the current user
    blocked: [],
    friendRequests: {
      sent: ["user8"],
      received: ["user9"],
    },
    profileVisibility: {
      showVisitors: true,
    },
  },
  {
    id: "user456",
    username: "musicfan",
    email: "musicfan@example.com",
    password: "password456", // In a real app, this would be hashed
    avatar: "/placeholder.svg",
    bio: "Music is life!",
    roses: 150,
    friends: [],
    following: [],
    followers: [],
    blocked: [],
    friendRequests: {
      sent: [],
      received: [],
    },
    profileVisibility: {
      showVisitors: true,
    },
  },
]

// Track profile visits
const profileVisits = [{ visitorId: "user456", profileId: "user123", timestamp: new Date().toISOString() }]

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Simulate loading user from storage on mount
  useEffect(() => {
    // In a real app, this would check for a token in localStorage
    // and make an API call to get the user data
    setTimeout(() => {
      setUser(mockUsers[0])
      setIsLoading(false)
    }, 500)
  }, [])

  const login = async (email: string, password: string) => {
    // In a real app, this would make an API call to authenticate
    setIsLoading(true)

    try {
      // Find user with matching email and password
      const foundUser = mockUsers.find((u) => u.email === email && u.password === password)

      if (foundUser) {
        // Remove password from user object before setting state
        const { password, ...userWithoutPassword } = foundUser
        setUser(userWithoutPassword)
        return true
      }

      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    // In a real app, this would clear the token from localStorage
    // and make an API call to logout
    setUser(null)
  }

  const checkUsernameAvailability = async (username: string) => {
    // In a real app, this would make an API call to check if username exists
    // For now, check against our mock users
    const isAvailable = !mockUsers.some((u) => u.username.toLowerCase() === username.toLowerCase())
    return isAvailable
  }

  const signup = async (email: string, password: string, username: string) => {
    setIsLoading(true)

    try {
      // Check if email already exists
      if (mockUsers.some((u) => u.email === email)) {
        return { success: false, message: "Email already in use" }
      }

      // Check if username already exists
      const isUsernameAvailable = await checkUsernameAvailability(username)
      if (!isUsernameAvailable) {
        return { success: false, message: "Username already taken" }
      }

      // Create new user
      const newUser = {
        id: `user${Date.now()}`,
        username,
        email,
        password, // In a real app, this would be hashed
        avatar: "/placeholder.svg",
        bio: "",
        roses: 50, // Starting roses for new users
        friends: [],
        following: [],
        followers: [],
        blocked: [],
        friendRequests: {
          sent: [],
          received: [],
        },
        profileVisibility: {
          showVisitors: true,
        },
      }

      // Add to mock database
      mockUsers.push(newUser)

      // Set as current user (without password)
      const { password: _, ...userWithoutPassword } = newUser
      setUser(userWithoutPassword)

      return { success: true, message: "Account created successfully" }
    } finally {
      setIsLoading(false)
    }
  }

  const updateProfile = (data: Partial<User>) => {
    if (!user) return

    // In a real app, this would make an API call to update the user
    setUser({
      ...user,
      ...data,
    })

    // Update in mock database
    const userIndex = mockUsers.findIndex((u) => u.id === user.id)
    if (userIndex !== -1) {
      mockUsers[userIndex] = {
        ...mockUsers[userIndex],
        ...data,
      }
    }
  }

  const updateUser = updateProfile // Alias for compatibility

  const getFriendStatus = (userId: string): FriendStatus => {
    if (!user) return "not_friend"

    if (user.friends?.includes(userId)) {
      return "friends"
    }

    if (user.friendRequests?.sent.includes(userId)) {
      return "request_sent"
    }

    if (user.friendRequests?.received.includes(userId)) {
      return "request_received"
    }

    return "not_friend"
  }

  const sendFriendRequest = (userId: string) => {
    if (!user) return

    // In a real app, this would make an API call to send a friend request
    setUser({
      ...user,
      friendRequests: {
        sent: [...(user.friendRequests?.sent || []), userId],
        received: user.friendRequests?.received || [],
      },
    })
  }

  const acceptFriendRequest = (userId: string) => {
    if (!user) return

    // In a real app, this would make an API call to accept a friend request
    setUser({
      ...user,
      friends: [...(user.friends || []), userId],
      friendRequests: {
        sent: user.friendRequests?.sent || [],
        received: (user.friendRequests?.received || []).filter((id) => id !== userId),
      },
    })
  }

  const removeFriend = (userId: string) => {
    if (!user) return

    // In a real app, this would make an API call to remove a friend
    setUser({
      ...user,
      friends: (user.friends || []).filter((id) => id !== userId),
      friendRequests: {
        sent: (user.friendRequests?.sent || []).filter((id) => id !== userId),
        received: (user.friendRequests?.received || []).filter((id) => id !== userId),
      },
    })
  }

  const blockUser = (userId: string) => {
    if (!user) return

    // In a real app, this would make an API call to block a user
    setUser({
      ...user,
      blocked: [...(user.blocked || []), userId],
      friends: (user.friends || []).filter((id) => id !== userId),
      following: (user.following || []).filter((id) => id !== userId),
      followers: (user.followers || []).filter((id) => id !== userId),
      friendRequests: {
        sent: (user.friendRequests?.sent || []).filter((id) => id !== userId),
        received: (user.friendRequests?.received || []).filter((id) => id !== userId),
      },
    })
  }

  const unblockUser = (userId: string) => {
    if (!user) return

    // In a real app, this would make an API call to unblock a user
    setUser({
      ...user,
      blocked: (user.blocked || []).filter((id) => id !== userId),
    })
  }

  const isBlocked = (userId: string): boolean => {
    if (!user) return false
    return (user.blocked || []).includes(userId)
  }

  const isFollowing = (userId: string): boolean => {
    if (!user) return false
    return (user.following || []).includes(userId)
  }

  const isFollower = (userId: string): boolean => {
    if (!user) return false
    return (user.followers || []).includes(userId)
  }

  const followUser = (userId: string) => {
    if (!user) return

    // In a real app, this would make an API call to follow a user
    setUser({
      ...user,
      following: [...(user.following || []), userId],
    })
  }

  const unfollowUser = (userId: string) => {
    if (!user) return

    // In a real app, this would make an API call to unfollow a user
    setUser({
      ...user,
      following: (user.following || []).filter((id) => id !== userId),
    })
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        signup,
        updateProfile,
        checkUsernameAvailability,
        getFriendStatus,
        sendFriendRequest,
        acceptFriendRequest,
        removeFriend,
        blockUser,
        unblockUser,
        isBlocked,
        isFollowing,
        isFollower,
        followUser,
        unfollowUser,
        isLoading,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

// Function to record a profile visit
export async function recordProfileVisit(visitorId: string, profileId: string) {
  // Don't record if same user
  if (visitorId === profileId) return

  // Check if visitor and profile owner have visibility enabled
  const visitor = mockUsers.find((u) => u.id === visitorId)
  const profileOwner = mockUsers.find((u) => u.id === profileId)

  if (!visitor || !profileOwner) return
  if (!visitor.profileVisibility?.showVisitors || !profileOwner.profileVisibility?.showVisitors) return

  // Add visit to history
  profileVisits.push({
    visitorId,
    profileId,
    timestamp: new Date().toISOString(),
  })
}

// Function to get profile visitors
export async function getProfileVisitors(profileId: string) {
  // Get all visits to this profile
  const visits = profileVisits
    .filter((visit) => visit.profileId === profileId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  // Get unique visitors (most recent first)
  const uniqueVisitorIds = [...new Set(visits.map((visit) => visit.visitorId))]

  // Get visitor details
  return uniqueVisitorIds
    .map((visitorId) => {
      const visitor = mockUsers.find((u) => u.id === visitorId)
      const visit = visits.find((v) => v.visitorId === visitorId)

      if (!visitor || !visit) return null

      return {
        id: visitor.id,
        username: visitor.username,
        avatar: visitor.avatar,
        timestamp: visit.timestamp,
      }
    })
    .filter(Boolean)
}
