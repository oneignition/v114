"use server"

// In-memory storage for demonstration purposes
// In a real app, this would be stored in a database
let userRoses = 100
let lastClaimTime = new Date(Date.now() - 6 * 60 * 1000) // 6 minutes ago, so user can claim immediately

// Mock top rankings data
const topRankingsData = [
  {
    id: "1",
    rank: 1,
    song: "Lose My Breath",
    artist: "Stray Kids",
    roses: 10000,
    image: "/placeholder.svg?height=100&width=100",
    comments: [
      {
        id: 1,
        username: "straykids_fan",
        avatar: "/placeholder.svg",
        text: "Lose My Breath is such a masterpiece! Stray Kids outdid themselves!",
        timestamp: "2023-06-01T12:00:00Z",
        roses: 50,
        replies: [],
      },
      {
        id: 2,
        username: "skz_forever",
        avatar: "/placeholder.svg",
        text: "The choreography for this song is insane!",
        timestamp: "2023-06-01T12:30:00Z",
        roses: 30,
        replies: [],
      },
      {
        id: 3,
        username: "musiclover",
        avatar: "/placeholder.svg",
        text: "This deserves to be #1! The production quality is amazing.",
        timestamp: "2023-06-01T13:00:00Z",
        roses: 40,
        replies: [],
      },
    ],
  },
  {
    id: "2",
    rank: 2,
    song: "Dynamite",
    artist: "BTS",
    roses: 9500,
    image: "/placeholder.svg?height=100&width=100",
    comments: [
      {
        id: 1,
        username: "bts_army",
        avatar: "/placeholder.svg",
        text: "Dynamite is the song that got me into K-pop! BTS legends!",
        timestamp: "2023-06-02T10:00:00Z",
        roses: 45,
        replies: [],
      },
      {
        id: 2,
        username: "purpleyou",
        avatar: "/placeholder.svg",
        text: "The retro vibes in this song are everything!",
        timestamp: "2023-06-02T11:15:00Z",
        roses: 28,
        replies: [],
      },
      {
        id: 3,
        username: "dynamite_fan",
        avatar: "/placeholder.svg",
        text: "I can't believe this is only #2, it should be higher!",
        timestamp: "2023-06-02T14:20:00Z",
        roses: 35,
        replies: [],
      },
    ],
  },
  {
    id: "3",
    rank: 3,
    song: "How You Like That",
    artist: "BLACKPINK",
    roses: 9000,
    image: "/placeholder.svg?height=100&width=100",
    comments: [
      {
        id: 1,
        username: "blackpink_blink",
        avatar: "/placeholder.svg",
        text: "How You Like That is such a banger! BLACKPINK in your area!",
        timestamp: "2023-06-03T09:30:00Z",
        roses: 42,
        replies: [],
      },
      {
        id: 2,
        username: "rosé_stan",
        avatar: "/placeholder.svg",
        text: "Rosé's voice in this song gives me chills every time!",
        timestamp: "2023-06-03T13:45:00Z",
        roses: 33,
        replies: [],
      },
      {
        id: 3,
        username: "kpop_queen",
        avatar: "/placeholder.svg",
        text: "The beat drop in this song is legendary!",
        timestamp: "2023-06-03T16:20:00Z",
        roses: 38,
        replies: [],
      },
    ],
  },
  {
    id: "4",
    rank: 4,
    song: "Fancy",
    artist: "TWICE",
    roses: 8500,
    image: "/placeholder.svg?height=100&width=100",
    comments: [
      {
        id: 1,
        username: "twice_fan",
        avatar: "/placeholder.svg",
        text: "Fancy is the song that made me a ONCE! So catchy!",
        timestamp: "2023-06-04T08:15:00Z",
        roses: 39,
        replies: [],
      },
      {
        id: 2,
        username: "twicetagram",
        avatar: "/placeholder.svg",
        text: "Nayeon's lines in this song are perfection!",
        timestamp: "2023-06-04T12:30:00Z",
        roses: 27,
        replies: [],
      },
      {
        id: 3,
        username: "fancy_you",
        avatar: "/placeholder.svg",
        text: "This song deserves more roses! It's a masterpiece!",
        timestamp: "2023-06-04T15:45:00Z",
        roses: 31,
        replies: [],
      },
    ],
  },
  {
    id: "5",
    rank: 5,
    song: "Growl",
    artist: "EXO",
    roses: 8000,
    image: "/placeholder.svg?height=100&width=100",
    comments: [
      {
        id: 1,
        username: "exo_l",
        avatar: "/placeholder.svg",
        text: "Growl is a timeless classic! EXO legends!",
        timestamp: "2023-06-05T10:20:00Z",
        roses: 41,
        replies: [],
      },
      {
        id: 2,
        username: "exo_planet",
        avatar: "/placeholder.svg",
        text: "The harmonies in this song are unmatched!",
        timestamp: "2023-06-05T14:10:00Z",
        roses: 29,
        replies: [],
      },
      {
        id: 3,
        username: "kai_dancer",
        avatar: "/placeholder.svg",
        text: "Kai's dance break in this song is everything!",
        timestamp: "2023-06-05T17:30:00Z",
        roses: 36,
        replies: [],
      },
    ],
  },
]

// Get user's rose count
export async function getUserRoses() {
  // In a real app, this would fetch from a database
  return userRoses
}

// Get top rankings
export async function getTopRankings() {
  // In a real app, this would fetch from a database
  return topRankingsData.map(({ comments, ...rest }) => rest) // Exclude comments from rankings list
}

// Get song by ID
export async function getSongById(id: string) {
  // In a real app, this would fetch from a database
  return topRankingsData.find((song) => song.id === id) || null
}

// Give roses to a song or user
export async function giveRoses(formData: FormData) {
  const amount = Number.parseInt(formData.get("amount") as string, 10)
  const recipientId = formData.get("recipientId") as string
  const recipientType = formData.get("recipientType") as string

  // Validate input
  if (isNaN(amount) || amount <= 0) {
    return {
      success: false,
      message: "Invalid rose amount",
    }
  }

  // Check if user has enough roses
  if (amount > userRoses) {
    return {
      success: false,
      message: "Not enough roses",
    }
  }

  // In a real app, this would update the database
  userRoses -= amount

  // Update recipient's rose count
  if (recipientType === "song") {
    const songIndex = topRankingsData.findIndex((song) => song.id === recipientId)
    if (songIndex !== -1) {
      topRankingsData[songIndex].roses += amount
    }
  }

  return {
    success: true,
    message: `Successfully gave ${amount} roses`,
    newUserRoses: userRoses,
  }
}

// Claim free roses
export async function claimFreeRoses(checkOnly = false) {
  const now = new Date()
  const fiveMinutesInMs = 5 * 60 * 1000 // Changed from 4 hours to 5 minutes
  const timeSinceLastClaim = now.getTime() - lastClaimTime.getTime()

  // Check if 5 minutes have passed since last claim
  if (timeSinceLastClaim < fiveMinutesInMs) {
    const timeLeft = fiveMinutesInMs - timeSinceLastClaim
    const minutes = Math.floor(timeLeft / (1000 * 60))
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000)

    return {
      success: false,
      message: `Please wait ${minutes}m ${seconds}s before claiming more roses`,
      timeLeft: { hours: 0, minutes, seconds },
    }
  }

  // If just checking, return success
  if (checkOnly) {
    return {
      success: true,
    }
  }

  // In a real app, this would update the database
  userRoses += 15
  lastClaimTime = now

  return {
    success: true,
    message: "Successfully claimed 15 roses",
    newUserRoses: userRoses,
    nextClaimTime: new Date(now.getTime() + fiveMinutesInMs),
  }
}

// Get time until next claim
export async function getTimeUntilNextClaim() {
  const now = new Date()
  const fiveMinutesInMs = 5 * 60 * 1000 // Changed from 4 hours to 5 minutes
  const timeSinceLastClaim = now.getTime() - lastClaimTime.getTime()

  if (timeSinceLastClaim < fiveMinutesInMs) {
    return fiveMinutesInMs - timeSinceLastClaim
  }

  return 0
}
