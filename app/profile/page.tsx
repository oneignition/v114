"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Header } from "@/components/Header"
import { theme } from "@/config/theme"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  FlowerIcon as Rose,
  Music,
  Heart,
  MessageCircle,
  ImageIcon,
  Calendar,
  Edit,
  Users,
  X,
  Eye,
  EyeOff,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { MiniRoom3D } from "@/components/MiniRoom3D"
import { MobileLayout } from "@/components/mobile/MobileLayout"
import { EditProfileModal } from "@/components/EditProfileModal"
import { recordProfileVisit, getProfileVisitors } from "@/contexts/auth-context"

export default function ProfilePage() {
  const { user, isLoading, updateUser } = useAuth()
  const router = useRouter()
  const [isPlaying, setIsPlaying] = useState(false)
  const [newGuestMessage, setNewGuestMessage] = useState("")
  const [newDiaryTitle, setNewDiaryTitle] = useState("")
  const [newDiaryContent, setNewDiaryContent] = useState("")
  const [diaryImage, setDiaryImage] = useState<string | null>(null)
  const [visitors, setVisitors] = useState<any[]>([])
  const [diaryEntries, setDiaryEntries] = useState<any[]>([])
  const [guestbook, setGuestbook] = useState<any[]>([])
  const [photos, setPhotos] = useState<any[]>([])
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false)
  const diaryFileInputRef = useRef<HTMLInputElement>(null)
  const photoFileInputRef = useRef<HTMLInputElement>(null)

  // Sample data for the profile
  const sampleDiaryEntries = [
    {
      id: 1,
      title: "Went to BTS Concert!",
      content:
        "Today was amazing! I finally got to see BTS live in concert. The energy was incredible and they performed all my favorite songs!",
      date: "2023-06-15",
      mood: "Excited",
      image: "/placeholder.svg",
      likes: 24,
      comments: 8,
    },
    {
      id: 2,
      title: "New BLACKPINK Album",
      content:
        'Just listened to the new BLACKPINK album and it\'s absolutely fire! "Pink Venom" is definitely my favorite track.',
      date: "2023-05-20",
      mood: "Happy",
      image: "/placeholder.svg",
      likes: 18,
      comments: 5,
    },
  ]

  const sampleGuestbook = [
    {
      id: 1,
      username: "musiclover",
      avatar: "/placeholder.svg",
      message: "Love your mini-hompy! The decorations are so cute!",
      timestamp: "2023-06-10 14:30",
    },
    {
      id: 2,
      username: "kpopfan1",
      avatar: "/placeholder.svg",
      message: "Thanks for the roses you sent me! Your taste in music is amazing.",
      timestamp: "2023-06-08 09:15",
    },
  ]

  const samplePhotos = [
    { id: 1, image: "/placeholder.svg", caption: "At the BTS concert", date: "2023-06-15" },
    { id: 2, image: "/placeholder.svg", caption: "My K-pop album collection", date: "2023-05-20" },
    { id: 3, image: "/placeholder.svg", caption: "BLACKPINK merch haul", date: "2023-04-10" },
    { id: 4, image: "/placeholder.svg", caption: "K-pop dance cover practice", date: "2023-03-25" },
  ]

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  // Load profile visitors
  useEffect(() => {
    if (user) {
      // Record visit to own profile (will be filtered out)
      recordProfileVisit(user.id, user.id)

      // Load visitors
      const loadVisitors = async () => {
        try {
          const profileVisitors = await getProfileVisitors(user.id)
          setVisitors(profileVisitors || [])
        } catch (error) {
          console.error("Error loading visitors:", error)
        }
      }

      loadVisitors()

      // Load sample data
      setDiaryEntries(sampleDiaryEntries)
      setGuestbook(sampleGuestbook)
      setPhotos(samplePhotos)
    }
  }, [user])

  const toggleProfileVisibility = () => {
    if (!user) return

    updateUser({
      profileVisibility: {
        ...user.profileVisibility,
        showVisitors: !user.profileVisibility?.showVisitors,
      },
    })
  }

  const toggleMusic = () => {
    setIsPlaying(!isPlaying)
    // In a real implementation, you would play/pause the background music here
  }

  const handleGuestbookSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newGuestMessage.trim()) {
      const newMessage = {
        id: Date.now(),
        username: user?.username || "visitor",
        avatar: user?.avatar || "/placeholder.svg",
        message: newGuestMessage,
        timestamp: new Date().toISOString().slice(0, 10) + " " + new Date().toTimeString().slice(0, 5),
      }
      setGuestbook([newMessage, ...guestbook])
      setNewGuestMessage("")
    }
  }

  const handleDiarySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newDiaryTitle.trim() && newDiaryContent.trim()) {
      const newEntry = {
        id: Date.now(),
        title: newDiaryTitle,
        content: newDiaryContent,
        date: new Date().toISOString().slice(0, 10),
        mood: "Happy",
        image: diaryImage || "/placeholder.svg",
        likes: 0,
        comments: 0,
      }
      setDiaryEntries([newEntry, ...diaryEntries])
      setNewDiaryTitle("")
      setNewDiaryContent("")
      setDiaryImage(null)
      if (diaryFileInputRef.current) {
        diaryFileInputRef.current.value = ""
      }
    }
  }

  const handleDiaryImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // In a real app, you would upload the file to a server
      // For now, we'll create a local URL for the image
      const imageUrl = URL.createObjectURL(file)
      setDiaryImage(imageUrl)
    }
  }

  const removeDiaryImage = () => {
    setDiaryImage(null)
    if (diaryFileInputRef.current) {
      diaryFileInputRef.current.value = ""
    }
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // In a real app, you would upload the file to a server
      // For now, we'll create a local URL for the image
      const imageUrl = URL.createObjectURL(file)
      const newPhoto = {
        id: Date.now(),
        image: imageUrl,
        caption: "New photo",
        date: new Date().toISOString().slice(0, 10),
      }
      setPhotos([newPhoto, ...photos])
      if (photoFileInputRef.current) {
        photoFileInputRef.current.value = ""
      }
    }
  }

  const handleSaveProfile = (profileData: { username?: string; bio?: string; avatar?: string; email?: string }) => {
    // In a real app, you would send this data to your backend
    // For now, we'll just update the local state
    if (updateUser) {
      updateUser({
        ...user,
        ...profileData,
      })
    }
  }

  // Show loading or nothing while checking auth
  if (isLoading || !user) {
    return (
      <div style={{ backgroundColor: theme.colors.background }} className="min-h-screen">
        <Header theme={theme} />
        <main className="container mx-auto p-4 flex justify-center items-center">
          <p>Loading profile...</p>
        </main>
      </div>
    )
  }

  return (
    <MobileLayout>
      <div style={{ backgroundColor: theme.colors.background }} className="min-h-screen">
        <Header theme={theme} />
        <main className="container mx-auto p-4">
          <h1 className="text-3xl font-bold text-center mb-6">My Profile</h1>
          <div className="max-w-5xl mx-auto">
            {/* Cyworld-style header */}
            <div className="bg-white rounded-t-lg p-4 border-b-4 border-pink-300 flex justify-between items-center">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-pink-500">{user.username}'s Mini-Hompy</h1>
                <Button variant="ghost" size="sm" className="ml-2" onClick={toggleMusic}>
                  <Music className={`h-4 w-4 ${isPlaying ? "text-pink-500" : "text-gray-400"}`} />
                </Button>
              </div>
              <div className="text-sm text-gray-500">Today's visitors: {visitors.length} | Total: 1,234</div>
            </div>

            <div className="bg-white p-4 rounded-b-lg shadow-md">
              {/* Main 3D Mini Room */}
              <div className="mb-6">
                <Card className="border-2 border-pink-200 rounded-lg overflow-hidden">
                  <div className="p-4">
                    <h3 className="text-xl font-semibold mb-2 flex items-center">
                      <span className="mr-2">{user.username}'s Mini Room</span>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-3 w-3" />
                      </Button>
                    </h3>
                  </div>
                  <div className="h-[500px]">
                    <MiniRoom3D />
                  </div>
                </Card>
              </div>

              {/* Profile and Content Sections */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Left sidebar - Profile */}
                <div className="space-y-4">
                  {/* Profile section */}
                  <Card className="p-4 border-2 border-pink-200 rounded-lg">
                    <div className="flex flex-col items-center">
                      <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-pink-300 mb-3">
                        <Image
                          src={user.avatar || "/placeholder.svg"}
                          alt={user.username}
                          width={128}
                          height={128}
                          className="object-cover"
                        />
                      </div>
                      <h2 className="text-xl font-bold">{user.username}</h2>
                      <p className="text-sm text-gray-500">{user.email}</p>
                      <div className="mt-2 flex items-center">
                        <Rose className="h-4 w-4 mr-1 text-pink-500" />
                        <span className="text-sm">1,234 Roses</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3 w-full"
                        onClick={() => setIsEditProfileOpen(true)}
                      >
                        <Edit className="h-3 w-3 mr-1" /> Edit Profile
                      </Button>
                    </div>
                    <div className="mt-4 pt-4 border-t border-pink-100">
                      <h3 className="text-sm font-semibold mb-2">Today's Mood</h3>
                      <div className="flex justify-center space-x-2">
                        <Button variant="ghost" size="sm" className="text-yellow-500">
                          😊
                        </Button>
                        <Button variant="ghost" size="sm" className="text-blue-500">
                          😢
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-500">
                          😡
                        </Button>
                        <Button variant="ghost" size="sm" className="text-purple-500">
                          😴
                        </Button>
                      </div>
                    </div>
                  </Card>

                  {/* Recent Visitors */}
                  <Card className="p-4 border-2 border-pink-200 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-lg font-semibold flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        <span>Recent Visitors</span>
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleProfileVisibility}
                        title={user.profileVisibility?.showVisitors ? "Hide profile visits" : "Show profile visits"}
                      >
                        {user.profileVisibility?.showVisitors ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                      </Button>
                    </div>

                    {user.profileVisibility?.showVisitors ? (
                      <div className="space-y-2">
                        {visitors.length > 0 ? (
                          visitors.map((visitor) => (
                            <div key={visitor.id} className="flex items-center space-x-2">
                              <div className="w-8 h-8 rounded-full overflow-hidden">
                                <Image
                                  src={visitor.avatar || "/placeholder.svg"}
                                  alt={visitor.username}
                                  width={32}
                                  height={32}
                                  className="object-cover"
                                />
                              </div>
                              <div>
                                <p className="text-sm font-medium">{visitor.username}</p>
                                <p className="text-xs text-gray-500">
                                  {new Date(visitor.timestamp).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500">No visitors yet</p>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-2">
                        <p className="text-sm text-gray-500">Profile visits are hidden</p>
                        <p className="text-xs text-gray-400">Enable to see who visited your profile</p>
                      </div>
                    )}
                  </Card>
                </div>

                {/* Main content area */}
                <div className="md:col-span-2 space-y-4">
                  <Tabs defaultValue="diary" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="diary" className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        Diary
                      </TabsTrigger>
                      <TabsTrigger value="guestbook" className="flex items-center">
                        <MessageCircle className="h-4 w-4 mr-1" />
                        Guestbook
                      </TabsTrigger>
                      <TabsTrigger value="photos" className="flex items-center">
                        <ImageIcon className="h-4 w-4 mr-1" />
                        Photos
                      </TabsTrigger>
                    </TabsList>

                    {/* Diary Tab */}
                    <TabsContent value="diary" className="space-y-4">
                      <Card className="p-4 border-2 border-pink-200 rounded-lg">
                        <h3 className="text-lg font-semibold mb-2">New Diary Entry</h3>
                        <form onSubmit={handleDiarySubmit} className="space-y-3">
                          <Input
                            placeholder="Title"
                            value={newDiaryTitle}
                            onChange={(e) => setNewDiaryTitle(e.target.value)}
                          />
                          <Textarea
                            placeholder="What's on your mind today?"
                            value={newDiaryContent}
                            onChange={(e) => setNewDiaryContent(e.target.value)}
                            rows={4}
                          />

                          {diaryImage && (
                            <div className="relative mb-2">
                              <div className="relative h-40 w-full rounded-md overflow-hidden">
                                <Image
                                  src={diaryImage || "/placeholder.svg"}
                                  alt="Diary image"
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <Button
                                variant="destructive"
                                size="icon"
                                className="absolute top-2 right-2 h-6 w-6 rounded-full"
                                onClick={removeDiaryImage}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          )}

                          <div className="flex justify-between">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => diaryFileInputRef.current?.click()}
                            >
                              <ImageIcon className="h-4 w-4 mr-1" />
                              Add Photo
                            </Button>
                            <input
                              type="file"
                              ref={diaryFileInputRef}
                              onChange={handleDiaryImageUpload}
                              accept="image/*"
                              className="hidden"
                            />
                            <Button
                              type="submit"
                              className="bg-pink-500 hover:bg-pink-600 text-white"
                              disabled={!newDiaryTitle.trim() || !newDiaryContent.trim()}
                            >
                              Post
                            </Button>
                          </div>
                        </form>
                      </Card>

                      {diaryEntries.map((entry) => (
                        <Card key={entry.id} className="p-4 border-2 border-pink-200 rounded-lg">
                          <div className="flex justify-between items-start">
                            <h3 className="text-lg font-semibold">{entry.title}</h3>
                            <div className="text-sm text-gray-500">{entry.date}</div>
                          </div>
                          <div className="text-sm text-pink-500 mb-2">Mood: {entry.mood}</div>
                          <p className="mb-3">{entry.content}</p>
                          {entry.image && (
                            <div className="mb-3">
                              <Image
                                src={entry.image || "/placeholder.svg"}
                                alt={entry.title}
                                width={400}
                                height={300}
                                className="rounded-lg w-full object-cover"
                              />
                            </div>
                          )}
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <button className="flex items-center">
                              <Heart className="h-4 w-4 mr-1 text-pink-500" />
                              {entry.likes} Likes
                            </button>
                            <button className="flex items-center">
                              <MessageCircle className="h-4 w-4 mr-1 text-blue-500" />
                              {entry.comments} Comments
                            </button>
                          </div>
                        </Card>
                      ))}
                    </TabsContent>

                    {/* Guestbook Tab */}
                    <TabsContent value="guestbook" className="space-y-4">
                      <Card className="p-4 border-2 border-pink-200 rounded-lg">
                        <h3 className="text-lg font-semibold mb-2">Leave a Message</h3>
                        <form onSubmit={handleGuestbookSubmit} className="space-y-3">
                          <Textarea
                            placeholder="Write a message..."
                            value={newGuestMessage}
                            onChange={(e) => setNewGuestMessage(e.target.value)}
                            rows={3}
                          />
                          <div className="flex justify-end">
                            <Button
                              type="submit"
                              className="bg-pink-500 hover:bg-pink-600 text-white"
                              disabled={!newGuestMessage.trim()}
                            >
                              Post
                            </Button>
                          </div>
                        </form>
                      </Card>

                      {guestbook.map((message) => (
                        <Card key={message.id} className="p-4 border-2 border-pink-200 rounded-lg">
                          <div className="flex items-start space-x-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                              <Image
                                src={message.avatar || "/placeholder.svg"}
                                alt={message.username}
                                width={40}
                                height={40}
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-grow">
                              <div className="flex justify-between items-center">
                                <h4 className="font-semibold">{message.username}</h4>
                                <span className="text-xs text-gray-500">{message.timestamp}</span>
                              </div>
                              <p className="mt-1">{message.message}</p>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </TabsContent>

                    {/* Photos Tab */}
                    <TabsContent value="photos" className="space-y-4">
                      <Card className="p-4 border-2 border-pink-200 rounded-lg">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-semibold">My Photo Gallery</h3>
                          <Button
                            className="bg-pink-500 hover:bg-pink-600 text-white"
                            onClick={() => photoFileInputRef.current?.click()}
                          >
                            <ImageIcon className="h-4 w-4 mr-1" />
                            Upload Photo
                          </Button>
                          <input
                            type="file"
                            ref={photoFileInputRef}
                            onChange={handlePhotoUpload}
                            accept="image/*"
                            className="hidden"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          {photos.map((photo) => (
                            <div key={photo.id} className="space-y-1">
                              <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-pink-200">
                                <Image
                                  src={photo.image || "/placeholder.svg"}
                                  alt={photo.caption}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <p className="text-sm font-medium truncate">{photo.caption}</p>
                              <p className="text-xs text-gray-500">{photo.date}</p>
                            </div>
                          ))}
                        </div>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        onSave={handleSaveProfile}
      />
    </MobileLayout>
  )
}
