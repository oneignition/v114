import type React from "react"
import { Inter } from "next/font/google"
import { Chat } from "@/components/Chat"
import { AuthProvider } from "@/contexts/auth-context"
import { MobileApp } from "@/components/MobileApp"
import { AppStatusProvider } from "@/contexts/app-status-context"
import { NotificationsProvider } from "@/contexts/notifications-context"
import { MessagesProvider } from "@/contexts/messages-context"
import { SettingsProvider } from "@/contexts/settings-context"
import { Toaster } from "@/components/ui/toaster"
import "@/app/globals.css"
import { RoseProvider } from "@/contexts/rose-context"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="theme-color" content="#FF69B4" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={inter.className}>
        <AppStatusProvider>
          <AuthProvider>
            <SettingsProvider>
              <NotificationsProvider>
                <RoseProvider>
                  <MessagesProvider>
                    <MobileApp>
                      {children}
                      <Chat />
                      <Toaster />
                    </MobileApp>
                  </MessagesProvider>
                </RoseProvider>
              </NotificationsProvider>
            </SettingsProvider>
          </AuthProvider>
        </AppStatusProvider>
      </body>
    </html>
  )
}

export const metadata = {
      generator: 'v0.dev'
    };
