"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function Submit() {
  const [song, setSong] = useState("")
  const [artist, setArtist] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle song submission
    console.log("Song submitted:", song, artist)
    setSong("")
    setArtist("")
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Submit a Song</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-center text-gray-600">
          The song you're looking for is not there? Please submit and we will review it for inclusion on the website!
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input type="text" value={song} onChange={(e) => setSong(e.target.value)} placeholder="Song Title" required />
          <Input
            type="text"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            placeholder="Artist Name"
            required
          />
          <Button type="submit" className="w-full bg-pink-500 hover:bg-pink-600 text-white">
            Submit Song
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
