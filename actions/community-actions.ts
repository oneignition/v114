"use server"

import { revalidatePath } from "next/cache"

// Mock database for community posts
let communityPosts = [
  {
    id: 1,
    userId: "user1",
    username: "kpopfan1",
    avatar: "/placeholder.svg?height=40&width=40",
    content: "Just discovered this amazing new song by Stray Kids! What do you all think of their latest album?",
    timestamp: "2023-06-01T12:00:00Z",
    likes: 24,
    comments: 5,
    roses: 12,
    image: null,
  },
  {
    id: 2,
    userId: "user2",
    username: "musiclover",
    avatar: "/placeholder.svg?height=40&width=40",
    content: "Attended the BTS concert last night and it was absolutely incredible! The energy was unmatched!",
    timestamp: "2023-06-01T10:30:00Z",
    likes: 42,
    comments: 12,
    roses: 28,
    image: "/placeholder.svg?height=400&width=600",
  },
  {
    id: 3,
    userId: "user3",
    username: "blackpinkblink",
    avatar: "/placeholder.svg?height=40&width=40",
    content: "BLACKPINK's choreography in their latest MV is so powerful! I've been trying to learn it all week.",
    timestamp: "2023-06-01T09:15:00Z",
    likes: 36,
    comments: 8,
    roses: 18,
    image: null,
  },
  {
    id: 4,
    userId: "user5", // This is a user the mock user follows
    username: "twicefan",
    avatar: "/placeholder.svg?height=40&width=40",
    content: "TWICE's new album is absolutely amazing! Every song is a bop!",
    timestamp: "2023-06-02T14:30:00Z",
    likes: 56,
    comments: 15,
    roses: 32,
    image: "/placeholder.svg?height=400&width=600",
  },
  {
    id: 5,
    userId: "user6", // This is a user the mock user follows
    username: "redvelvetjoy",
    avatar: "/placeholder.svg?height=40&width=40",
    content: "Red Velvet's vocals in their latest comeback are incredible. Joy's high notes gave me chills!",
    timestamp: "2023-06-02T16:45:00Z",
    likes: 48,
    comments: 10,
    roses: 25,
    image: null,
  },
  {
    id: 6,
    userId: "user7",
    username: "itzystan",
    avatar: "/placeholder.svg?height=40&width=40",
    content: "ITZY's dance practice video for their new song is insane! Their synchronization is perfect!",
    timestamp: "2023-06-03T08:20:00Z",
    likes: 62,
    comments: 18,
    roses: 40,
    image: "/placeholder.svg?height=400&width=600",
  },
  {
    id: 7,
    userId: "user8",
    username: "aespafan",
    avatar: "/placeholder.svg?height=40&width=40",
    content: "aespa's concept for their new comeback is so unique! I love the mix of reality and virtual world.",
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    likes: 75,
    comments: 22,
    roses: 45,
    image: null,
  },
  {
    id: 8,
    userId: "user9",
    username: "nctdream",
    avatar: "/placeholder.svg?height=40&width=40",
    content: "NCT DREAM's new album is a masterpiece! Every track shows their growth as artists.",
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
    likes: 85,
    comments: 28,
    roses: 50,
    image: "/placeholder.svg?height=400&width=600",
  },
  {
    id: 9,
    userId: "user10",
    username: "seventeencarat",
    avatar: "/placeholder.svg?height=40&width=40",
    content: "SEVENTEEN's choreography never disappoints! Their new dance break is mind-blowing!",
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
    likes: 95,
    comments: 32,
    roses: 55,
    image: null,
  },
  {
    id: 10,
    userId: "user123", // This is the current user
    username: "kpoplover",
    avatar: "/placeholder.svg?height=40&width=40",
    content: "Just created my first post on this amazing K-pop community app!",
    timestamp: new Date().toISOString(), // Just now
    likes: 0,
    comments: 0,
    roses: 0,
    image: null,
  },
]

// Get all posts sorted by timestamp (newest first)
export async function getAllPosts() {
  return [...communityPosts].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

// Get trending posts (sorted by engagement - likes + comments + roses)
export async function getTrendingPosts() {
  return [...communityPosts].sort((a, b) => b.likes + b.comments + b.roses - (a.likes + b.comments + a.roses))
}

// Get posts from users the current user follows
export async function getFollowingPosts() {
  // Mock user follows users with IDs "user5" and "user6"
  const followedUserIds = ["user5", "user6"]

  return [...communityPosts]
    .filter((post) => followedUserIds.includes(post.userId))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

// Create a new post
export async function createPost(formData: FormData) {
  const content = formData.get("content") as string
  const image = formData.get("image") as string | null

  if (!content && !image) {
    return { success: false, message: "Post must have content or an image" }
  }

  const newPost = {
    id: Date.now(),
    userId: "user123", // Current user ID
    username: "kpoplover", // Current username
    avatar: "/placeholder.svg?height=40&width=40",
    content,
    timestamp: new Date().toISOString(),
    likes: 0,
    comments: 0,
    roses: 0,
    image,
  }

  communityPosts = [newPost, ...communityPosts]
  revalidatePath("/community")

  return { success: true, post: newPost }
}

// Like a post
export async function likePost(postId: number) {
  const postIndex = communityPosts.findIndex((post) => post.id === postId)

  if (postIndex === -1) {
    return { success: false, message: "Post not found" }
  }

  communityPosts[postIndex].likes += 1
  revalidatePath("/community")

  return { success: true, likes: communityPosts[postIndex].likes }
}

// Comment on a post
export async function commentOnPost(postId: number, comment: string) {
  const postIndex = communityPosts.findIndex((post) => post.id === postId)

  if (postIndex === -1) {
    return { success: false, message: "Post not found" }
  }

  communityPosts[postIndex].comments += 1
  revalidatePath("/community")

  return { success: true, comments: communityPosts[postIndex].comments }
}

// Send roses to a post
export async function sendRosesToPost(postId: number, roses: number) {
  const postIndex = communityPosts.findIndex((post) => post.id === postId)

  if (postIndex === -1) {
    return { success: false, message: "Post not found" }
  }

  communityPosts[postIndex].roses += roses
  revalidatePath("/community")

  return { success: true, roses: communityPosts[postIndex].roses }
}
