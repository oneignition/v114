import { Header } from "@/components/Header"
import { Submit } from "@/components/Submit"
import { theme } from "@/config/theme"
import { MobileLayout } from "@/components/mobile/MobileLayout"

export default function SubmitPage() {
  return (
    <MobileLayout>
      <div style={{ backgroundColor: theme.colors.background }} className="min-h-screen">
        <Header theme={theme} />
        <main className="container mx-auto p-4">
          <h1 className="text-3xl font-bold text-center mb-6">Submit a Song</h1>
          <Submit />
        </main>
      </div>
    </MobileLayout>
  )
}
