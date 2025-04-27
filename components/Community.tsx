"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserProfileTrigger } from "./UserProfileTrigger"
import { ImageIcon, X, Heart, MessageSquare } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { useRoses } from "@/contexts/rose-context"
import {
  getAllPosts,
  getTrendingPosts,
  getFollowingPosts,
  createPost,
  likePost,
  commentOnPost,
  sendRosesToPost,
} from "@/actions/community-actions"

// Post type definition
interface Post {
  id: number
  userId: string
  username: string
  avatar: string
  content: string
  timestamp: string
  likes: number
  comments: number
  roses: number
  image: string | null
}

export function Community() {
  const { user } = useAuth()
  const { roseCount, updateRoseCount } = useRoses()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("all")
  const [newPost, setNewPost] = useState("")
  const [allPosts, setAllPosts] = useState<Post[]>([])
  const [trendingPosts, setTrendingPosts] = useState<Post[]>([])
  const [followingPosts, setFollowingPosts] = useState<Post[]>([])
  const [postImage, setPostImage] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showRoseModal, setShowRoseModal] = useState(false)
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fetch posts on initial load and when tab changes
  useEffect(() => {
    fetchPosts()
  }, [activeTab])

  const fetchPosts = async () => {
    try {
      // Fetch posts based on active tab
      if (activeTab === "all") {
        const posts = await getAllPosts()
        setAllPosts(posts)
      } else if (activeTab === "trending") {
        const posts = await getTrendingPosts()
        setTrendingPosts(posts)
      } else if (activeTab === "following") {
        const posts = await getFollowingPosts()
        setFollowingPosts(posts)
      }
    } catch (error) {
      console.error("Error fetching posts:", error)
      toast({
        title: "Error",
        description: "Failed to fetch posts. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newPost.trim() && !postImage) {
      toast({
        title: "Error",
        description: "Post must have content or an image",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("content", newPost)
      if (postImage) {
        formData.append("image", postImage)
      }

      const result = await createPost(formData)

      if (result.success) {
        setNewPost("")
        setPostImage(null)
        toast({
          title: "Success",
          description: "Your post has been published!",
        })

        // Refresh posts
        fetchPosts()
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to create post",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error creating post:", error)
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLike = async (postId: number) => {
    try {
      const result = await likePost(postId)

      if (result.success) {
        // Update post in state
        const updatePostInState = (posts: Post[]) => {
          return posts.map((post) => (post.id === postId ? { ...post, likes: result.likes } : post))
        }

        setAllPosts(updatePostInState(allPosts))
        setTrendingPosts(updatePostInState(trendingPosts))
        setFollowingPosts(updatePostInState(followingPosts))
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to like post",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error liking post:", error)
      toast({
        title: "Error",
        description: "Failed to like post. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleComment = async (postId: number) => {
    // In a real app, this would open a comment form
    // For now, we'll just increment the comment count
    try {
      const result = await commentOnPost(postId, "This is a comment")

      if (result.success) {
        // Update post in state
        const updatePostInState = (posts: Post[]) => {
          return posts.map((post) => (post.id === postId ? { ...post, comments: result.comments } : post))
        }

        setAllPosts(updatePostInState(allPosts))
        setTrendingPosts(updatePostInState(trendingPosts))
        setFollowingPosts(updatePostInState(followingPosts))

        toast({
          title: "Success",
          description: "Comment added!",
        })
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to add comment",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error commenting on post:", error)
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive",
      })
    }
  }

  const openRoseModal = (postId: number) => {
    setSelectedPostId(postId)
    setShowRoseModal(true)
  }

  const handleSendRoses = async (amount: number) => {
    if (!selectedPostId) return

    try {
      // First check if user has enough roses
      if (roseCount < amount) {
        toast({
          title: "Not Enough Roses",
          description: `You need ${amount} roses to send. You currently have ${roseCount} roses.`,
          variant: "destructive",
        })
        return
      }

      const result = await sendRosesToPost(selectedPostId, amount)

      if (result.success) {
        // Update post in state
        const updatePostInState = (posts: Post[]) => {
          return posts.map((post) => (post.id === selectedPostId ? { ...post, roses: result.roses } : post))
        }

        setAllPosts(updatePostInState(allPosts))
        setTrendingPosts(updatePostInState(trendingPosts))
        setFollowingPosts(updatePostInState(followingPosts))

        // Update user's rose count
        updateRoseCount(roseCount - amount)

        toast({
          title: "Success",
          description: `You sent ${amount} roses!`,
        })
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to send roses",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error sending roses:", error)
      toast({
        title: "Error",
        description: "Failed to send roses. Please try again.",
        variant: "destructive",
      })
    } finally {
      setShowRoseModal(false)
      setSelectedPostId(null)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // In a real app, you would upload the file to a server
      // For now, we'll create a local URL for the image
      const imageUrl = URL.createObjectURL(file)
      setPostImage(imageUrl)
    }
  }

  const removeImage = () => {
    setPostImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl)
  }

  const closeImageModal = () => {
    setSelectedImage(null)
  }

  // Get posts based on active tab
  const getActivePosts = () => {
    switch (activeTab) {
      case "all":
        return allPosts
      case "trending":
        return trendingPosts
      case "following":
        return followingPosts
      default:
        return allPosts
    }
  }

  const renderPosts = (posts: Post[]) => {
    if (posts.length === 0) {
      return (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">
              {activeTab === "following" ? "Follow more users to see their posts here." : "No posts available."}
            </p>
          </CardContent>
        </Card>
      )
    }

    return posts.map((post) => (
      <Card key={post.id}>
        <CardHeader className="p-4 pb-0">
          <div className="flex items-start gap-3">
            <UserProfileTrigger
              user={{
                id: post.userId,
                username: post.username || "User",
                avatar: post.avatar || "/placeholder.svg",
                bio: "K-pop enthusiast and music lover",
                stats: {
                  posts: 42,
                  friends: 128,
                  roses: 1024,
                },
              }}
            >
              <Avatar>
                <AvatarImage src={post.avatar || "/placeholder.svg"} alt={post.username || "User"} />
                <AvatarFallback>{post.username ? post.username.substring(0, 2).toUpperCase() : "U"}</AvatarFallback>
              </Avatar>
            </UserProfileTrigger>
            <div className="flex-1">
              <UserProfileTrigger
                user={{
                  id: post.userId,
                  username: post.username || "User",
                  avatar: post.avatar || "/placeholder.svg",
                  bio: "K-pop enthusiast and music lover",
                  stats: {
                    posts: 42,
                    friends: 128,
                    roses: 1024,
                  },
                }}
              >
                <div className="font-semibold hover:underline">{post.username || "User"}</div>
              </UserProfileTrigger>
              <div className="text-sm text-gray-500">{new Date(post.timestamp).toLocaleString()}</div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <p>{post.content}</p>

          {post.image && (
            <div className="mt-3 mb-3">
              <div
                className="relative w-full rounded-md overflow-hidden cursor-pointer"
                onClick={() => handleImageClick(post.image || "")}
              >
                <img
                  src={post.image || "/placeholder.svg"}
                  alt="Post image"
                  className="w-full h-auto max-h-96 object-contain"
                />
              </div>
            </div>
          )}

          <div className="flex gap-4 mt-4">
            <Button variant="ghost" size="sm" onClick={() => handleLike(post.id)} className="flex items-center gap-1">
              <Heart className="h-4 w-4" /> {post.likes}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleComment(post.id)}
              className="flex items-center gap-1"
            >
              <MessageSquare className="h-4 w-4" /> {post.comments}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => openRoseModal(post.id)}
              className="flex items-center gap-1"
            >
              🌹 {post.roses}
            </Button>
          </div>
        </CardContent>
      </Card>
    ))
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handlePostSubmit}>
            <div className="flex gap-4">
              <Avatar>
                <AvatarImage src={user?.avatar || "/placeholder.svg"} alt="Your Avatar" />
                <AvatarFallback>{user?.username?.substring(0, 2).toUpperCase() || "YA"}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Input
                  placeholder="Share your thoughts about K-pop..."
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  className="mb-2"
                  disabled={isSubmitting}
                />

                {postImage && (
                  <div className="relative mb-2">
                    <div className="relative w-full rounded-md overflow-hidden">
                      <img
                        src={postImage || "/placeholder.svg"}
                        alt="Post image"
                        className="w-full h-auto max-h-40 object-contain"
                      />
                    </div>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6 rounded-full"
                      onClick={removeImage}
                      disabled={isSubmitting}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <Button type="button" variant="outline" size="sm" onClick={triggerFileInput} disabled={isSubmitting}>
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Add Image
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                    disabled={isSubmitting}
                  />
                  <Button type="submit" disabled={(!newPost.trim() && !postImage) || isSubmitting}>
                    {isSubmitting ? "Posting..." : "Post"}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All Posts</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
          <TabsTrigger value="following">Following</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="space-y-4 mt-4">
          {renderPosts(allPosts)}
        </TabsContent>
        <TabsContent value="trending" className="space-y-4 mt-4">
          {renderPosts(trendingPosts)}
        </TabsContent>
        <TabsContent value="following" className="space-y-4 mt-4">
          {renderPosts(followingPosts)}
        </TabsContent>
      </Tabs>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4"
          onClick={closeImageModal}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full">
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 z-10 h-8 w-8 rounded-full"
              onClick={(e) => {
                e.stopPropagation()
                closeImageModal()
              }}
            >
              <X className="h-4 w-4" />
            </Button>
            <img
              src={selectedImage || "/placeholder.svg"}
              alt="Enlarged post image"
              className="w-full h-auto max-h-[90vh] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* Rose Modal */}
      {showRoseModal && selectedPostId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-80 max-w-full">
            <h2 className="text-xl font-bold mb-4">Give Roses to this post</h2>

            <div className="mb-4">
              <p>
                Your roses: <span className="font-bold">{roseCount}</span> 🌹
              </p>
            </div>

            <div className="mb-4">
              <label className="block mb-2">Amount:</label>
              <input
                type="number"
                min="1"
                max={roseCount}
                defaultValue="1"
                className="w-full p-2 border rounded"
                id="roseAmount"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <button type="button" onClick={() => setShowRoseModal(false)} className="px-4 py-2 border rounded">
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const input = document.getElementById("roseAmount") as HTMLInputElement
                  const amount = Number.parseInt(input.value, 10)
                  if (amount > 0 && amount <= roseCount) {
                    handleSendRoses(amount)
                  }
                }}
                className="px-4 py-2 bg-pink-500 text-white rounded"
              >
                Give Roses
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
