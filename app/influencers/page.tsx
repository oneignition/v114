"use client"

import { Header } from "@/components/Header"
import { theme } from "@/config/theme"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Instagram, TwitterIcon as TikTok } from "lucide-react"
import { MobileLayout } from "@/components/mobile/MobileLayout"

interface Influencer {
  name: string
  socialMedia: "Instagram" | "TikTok"
  handle: string
  followers: number
  image: string
}

const influencers: Influencer[] = [
  { name: "Lisa", socialMedia: "Instagram", handle: "@lalalalisa_m", followers: 86000000, image: "/placeholder.svg" },
  { name: "Jisoo", socialMedia: "Instagram", handle: "@sooyaaa__", followers: 68000000, image: "/placeholder.svg" },
  {
    name: "Jennie",
    socialMedia: "Instagram",
    handle: "@jennierubyjane",
    followers: 75000000,
    image: "/placeholder.svg",
  },
  {
    name: "Rosé",
    socialMedia: "Instagram",
    handle: "@roses_are_rosie",
    followers: 67000000,
    image: "/placeholder.svg",
  },
  {
    name: "BTS",
    socialMedia: "TikTok",
    handle: "@bts_official_bighit",
    followers: 50000000,
    image: "/placeholder.svg",
  },
  { name: "Taeyong", socialMedia: "Instagram", handle: "@taeoxo_nct", followers: 10000000, image: "/placeholder.svg" },
  { name: "IU", socialMedia: "Instagram", handle: "@dlwlrma", followers: 30000000, image: "/placeholder.svg" },
  { name: "Sehun", socialMedia: "Instagram", handle: "@oohsehun", followers: 22000000, image: "/placeholder.svg" },
  { name: "Kai", socialMedia: "TikTok", handle: "@zkdlin", followers: 15000000, image: "/placeholder.svg" },
  {
    name: "Twice",
    socialMedia: "TikTok",
    handle: "@twice_tiktok_official",
    followers: 12000000,
    image: "/placeholder.svg",
  },
]

export default function InfluencersPage() {
  return (
    <MobileLayout>
      <div style={{ backgroundColor: theme.colors.background }} className="min-h-screen">
        <Header theme={theme} />
        <main className="container mx-auto p-4">
          <h1 className="text-3xl font-bold text-center mb-6">Top 10 K-pop Influencers</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {influencers.map((influencer, index) => (
              <Card key={index} className="overflow-hidden">
                <CardContent className="p-0">
                  <Image
                    src={influencer.image || "/placeholder.svg"}
                    alt={influencer.name}
                    width={400}
                    height={400}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h2 className="text-xl font-bold">{influencer.name}</h2>
                      {influencer.socialMedia === "Instagram" ? (
                        <Instagram className="h-6 w-6 text-pink-500" />
                      ) : (
                        <TikTok className="h-6 w-6 text-black" />
                      )}
                    </div>
                    <p className="text-gray-600 mb-1">{influencer.handle}</p>
                    <p className="text-sm text-gray-500 mb-3">{influencer.followers.toLocaleString()} followers</p>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() =>
                        window.open(
                          `https://www.${influencer.socialMedia.toLowerCase()}.com/${influencer.handle.slice(1)}`,
                          "_blank",
                        )
                      }
                    >
                      Follow on {influencer.socialMedia}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    </MobileLayout>
  )
}
