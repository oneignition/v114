import { getSongById, getTopRankings } from "@/actions/rose-actions"
import { SongDiscussion } from "@/components/SongDiscussion"
import { MobileLayout } from "@/components/mobile/MobileLayout"
import { Header } from "@/components/Header"
import { theme } from "@/config/theme"
import { NetworkStatus } from "@/components/NetworkStatus"
import { OrientationWarning } from "@/components/OrientationWarning"
import { WeeklyTimer } from "@/components/WeeklyTimer"
import { RoseCounter } from "@/components/RoseCounter"
import { RosePurchaseModal } from "@/components/RosePurchaseModal"
import { SurpriseBoxModal } from "@/components/SurpriseBoxModal"
import { TopRankings } from "@/components/TopRankings"

export default async function SongPage({ params }: { params: { id: string } }) {
  const song = await getSongById(params.id)
  const topRankings = await getTopRankings()

  if (!song) {
    return (
      <MobileLayout>
        <div className="flex items-center justify-center h-screen">
          <p>Song not found</p>
        </div>
      </MobileLayout>
    )
  }

  // Use the comments from the song data
  const comments = song.comments || []

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
              <SongDiscussion
                song={song.song}
                artist={song.artist}
                image={song.image}
                rank={song.rank}
                roses={song.roses}
                comments={comments}
              />
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
