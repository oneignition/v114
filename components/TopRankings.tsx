import Link from "next/link"
import { FlowerIcon as Rose } from "lucide-react"
import { theme } from "@/config/theme"

interface Ranking {
  id: string
  rank: number
  song: string
  artist: string
  roses: number
  image: string
}

interface TopRankingsProps {
  rankings: Ranking[]
}

export function TopRankings({ rankings }: TopRankingsProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h2 className="text-lg font-semibold mb-4">Top Rankings</h2>
      <div className="space-y-3">
        {rankings.map((ranking) => (
          <Link
            key={ranking.id}
            href={`/song/${ranking.id}`}
            className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-md transition-colors"
          >
            <span className="font-bold text-gray-500 w-6">{ranking.rank}</span>
            <img
              src={ranking.image || "/placeholder.svg"}
              alt={ranking.song}
              className="w-10 h-10 object-cover rounded-md"
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{ranking.song}</p>
              <p className="text-sm text-gray-500 truncate">{ranking.artist}</p>
            </div>
            <div className="flex items-center space-x-1">
              <span className="font-medium">{ranking.roses.toLocaleString()}</span>
              <Rose className="h-4 w-4" style={{ color: theme.colors.accent }} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
