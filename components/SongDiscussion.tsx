"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { UserProfileTrigger } from "./UserProfileTrigger"
import { GiveRosesModal } from "./GiveRosesModal"

export function SongDiscussion({ song, artist, image, rank, roses, comments }) {
  const [commentText, setCommentText] = useState("")
  const [displayedComments, setDisplayedComments] = useState(comments)
  const [showGiveRosesModal, setShowGiveRosesModal] = useState(false)
  const [selectedComment, setSelectedComment] = useState(null)

  const handleAddComment = () => {
    if (commentText.trim() === "") return

    const newComment = {
      id: Date.now(),
      username: "You",
      avatar: "/placeholder.svg",
      text: commentText,
      timestamp: new Date().toISOString(),
      roses: 0,
      replies: [],
    }

    setDisplayedComments([newComment, ...displayedComments])
    setCommentText("")
  }

  const handleGiveRosesToSong = () => {
    setSelectedComment(null)
    setShowGiveRosesModal(true)
  }

  const handleGiveRosesToComment = (comment) => {
    setSelectedComment(comment)
    setShowGiveRosesModal(true)
  }

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        {/* Restore the enlarged image for rank #1 */}
        <div className="flex flex-col md:flex-row gap-6 mb-6">
          <div className="w-full md:w-1/2">
            <img
              src={image || "/placeholder.svg"}
              alt={`${song} by ${artist}`}
              className="w-full h-auto rounded-lg object-cover aspect-square shadow-lg"
              style={{ maxHeight: "400px" }} // Ensure the image is large
            />
          </div>
          <div className="w-full md:w-1/2 flex flex-col justify-between">
            <div>
              <div className="flex items-center mb-2">
                <span className="bg-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full mr-2">#{rank}</span>
                <span className="text-pink-500 font-bold">{roses.toLocaleString()} roses</span>
              </div>
              <h2 className="text-2xl font-bold mb-1">{song}</h2>
              <p className="text-gray-600 mb-4">{artist}</p>
              <p className="text-gray-700 mb-6">
                Join the discussion about this amazing song! Share your thoughts and support with roses.
              </p>
            </div>
            <div className="flex gap-2">
              <Button className="bg-pink-500 hover:bg-pink-600" onClick={handleGiveRosesToSong}>
                Give Roses
              </Button>
              <Button variant="outline">Share</Button>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-bold mb-4">Discussion</h3>
          <div className="flex gap-4 mb-4">
            <Avatar>
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback>You</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Input
                placeholder="Add your comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="mb-2"
              />
              <Button onClick={handleAddComment} className="bg-pink-500 hover:bg-pink-600">
                Post
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {displayedComments.map((comment) => (
            <div key={comment.id} className="border-b pb-4">
              <div className="flex gap-4">
                <UserProfileTrigger
                  user={{
                    id: comment.id.toString(),
                    username: comment.username || "User",
                    avatar: comment.avatar || "/placeholder.svg",
                    bio: "K-pop enthusiast and music lover",
                    stats: {
                      posts: 42,
                      friends: 128,
                      roses: 1024,
                    },
                  }}
                >
                  <Avatar className="cursor-pointer">
                    <AvatarImage src={comment.avatar || "/placeholder.svg"} />
                    <AvatarFallback>{comment.username ? comment.username[0].toUpperCase() : "U"}</AvatarFallback>
                  </Avatar>
                </UserProfileTrigger>
                <div className="flex-1">
                  <div className="flex items-center mb-1">
                    <UserProfileTrigger
                      user={{
                        id: comment.id.toString(),
                        username: comment.username || "User",
                        avatar: comment.avatar || "/placeholder.svg",
                        bio: "K-pop enthusiast and music lover",
                        stats: {
                          posts: 42,
                          friends: 128,
                          roses: 1024,
                        },
                      }}
                    >
                      <span className="font-bold mr-2 cursor-pointer hover:underline">
                        {comment.username || "User"}
                      </span>
                    </UserProfileTrigger>
                    <span className="text-xs text-gray-500">{new Date(comment.timestamp).toLocaleDateString()}</span>
                  </div>
                  <p className="text-gray-700 mb-2">{comment.text}</p>
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-pink-500"
                      onClick={() => handleGiveRosesToComment(comment)}
                    >
                      🌹 {comment.roses}
                    </Button>
                    <Button variant="ghost" size="sm">
                      Reply
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>

      {/* Give Roses Modal */}
      <GiveRosesModal
        isOpen={showGiveRosesModal}
        onClose={() => setShowGiveRosesModal(false)}
        recipient={
          selectedComment
            ? {
                id: selectedComment.id.toString(),
                username: selectedComment.username || "User",
                avatar: selectedComment.avatar,
              }
            : { id: "song-" + song, username: artist }
        }
        songId={selectedComment ? null : "song-" + song}
        songName={selectedComment ? null : song}
      />
    </Card>
  )
}
