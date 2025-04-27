import { Header } from "@/components/Header"
import { RoseCounter } from "@/components/RoseCounter"
import { SongDiscussion } from "@/components/SongDiscussion"
import { RosePurchaseModal } from "@/components/RosePurchaseModal"
import { SurpriseBoxModal } from "@/components/SurpriseBoxModal"
import { TopRankings } from "@/components/TopRankings"
import { WeeklyTimer } from "@/components/WeeklyTimer"
import { theme } from "@/config/theme"
import { MobileLayout } from "@/components/mobile/MobileLayout"
import { NetworkStatus } from "@/components/NetworkStatus"
import { OrientationWarning } from "@/components/OrientationWarning"
import { getTopRankings } from "@/actions/rose-actions"

export default async function Home() {
  const topRankings = await getTopRankings()

  const comments = [
    {
      id: 1,
      username: "kpopfan1",
      avatar: "/placeholder.svg",
      text: "This song is amazing!",
      timestamp: "2023-06-01T12:00:00Z",
      roses: 50,
      replies: [],
    },
    {
      id: 2,
      username: "musiclover",
      avatar: "/placeholder.svg",
      text: "I can't stop listening to it!",
      timestamp: "2023-06-01T12:30:00Z",
      roses: 30,
      replies: [],
    },
    {
      id: 3,
      username: "straykidslover",
      avatar: "/placeholder.svg",
      text: "Stray Kids never disappoints!",
      timestamp: "2023-06-01T13:00:00Z",
      roses: 40,
      replies: [],
    },
  ]

  return (
    <MobileLayout>
      <NetworkStatus />
      <OrientationWarning />
      <div style={{ backgroundColor: theme.colors.background }} className="min-h-screen">
        <Header theme={theme} />
        <WeeklyTimer />
        <main className="container mx-auto p-4">
          <div className="grid gap-6 md:grid-cols-[1fr_300px]">
            <div>
              {topRankings.length > 0 && (
                <SongDiscussion
                  song={topRankings[0].song}
                  artist={topRankings[0].artist}
                  image={topRankings[0].image}
                  rank={topRankings[0].rank}
                  roses={topRankings[0].roses}
                  comments={comments}
                />
              )}
            </div>
            <div className="space-y-6">
              <RoseCounter />
              <div className="flex space-x-2">
                <RosePurchaseModal />
                <SurpriseBoxModal />
              </div>
              <TopRankings rankings={topRankings} />
            </div>
          </div>
        </main>
      </div>
    </MobileLayout>
  )
}
