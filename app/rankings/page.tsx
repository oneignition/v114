import { Header } from "@/components/Header"
import { theme } from "@/config/theme"
import { MobileLayout } from "@/components/mobile/MobileLayout"
import Link from "next/link"
import { getTopRankings } from "@/actions/rose-actions"

export default async function RankingsPage() {
  // Get rankings from the server action
  const topRankings = await getTopRankings()

  // Add more mock rankings to the list
  const rankings = [
    ...topRankings,
    {
      id: "6",
      rank: 6,
      song: "Gee",
      artist: "Girls' Generation",
      roses: 7500,
      image: "/placeholder.svg?height=100&width=100",
    },
    {
      id: "7",
      rank: 7,
      song: "Blood Sweat & Tears",
      artist: "BTS",
      roses: 7000,
      image: "/placeholder.svg?height=100&width=100",
    },
    {
      id: "8",
      rank: 8,
      song: "Red Flavor",
      artist: "Red Velvet",
      roses: 6500,
      image: "/placeholder.svg?height=100&width=100",
    },
    {
      id: "9",
      rank: 9,
      song: "Gangnam Style",
      artist: "PSY",
      roses: 6000,
      image: "/placeholder.svg?height=100&width=100",
    },
    { id: "10", rank: 10, song: "Tempo", artist: "EXO", roses: 5500, image: "/placeholder.svg?height=100&width=100" },
  ]

  return (
    <MobileLayout>
      <div style={{ backgroundColor: theme.colors.background }} className="min-h-screen">
        <Header theme={theme} />
        <main className="container mx-auto p-4">
          <h1 className="text-3xl font-bold text-center mb-6">Top Rankings</h1>
          <div className="space-y-4">
            {rankings.map((item) => (
              <Link href={`/song/${item.id}`} key={item.rank} className="block">
                <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div className="text-2xl font-bold w-8 text-center">{item.rank}</div>
                  <img
                    src={item.image || "/placeholder.svg"}
                    alt={item.song}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.song}</h3>
                    <p className="text-sm text-gray-500">{item.artist}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">🌹 {item.roses.toLocaleString()}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </main>
      </div>
    </MobileLayout>
  )
}
