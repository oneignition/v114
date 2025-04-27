import { Header } from "@/components/Header"
import { theme } from "@/config/theme"
import { MobileLayout } from "@/components/mobile/MobileLayout"
import { WorldGame } from "@/components/WorldGame"

export default function WorldPage() {
  return (
    <MobileLayout>
      <div style={{ backgroundColor: theme.colors.background }} className="min-h-screen">
        <Header theme={theme} />
        <main className="container mx-auto p-4">
          <h1 className="text-3xl font-bold text-center mb-6">K-Pop World</h1>
          <WorldGame />
        </main>
      </div>
    </MobileLayout>
  )
}
