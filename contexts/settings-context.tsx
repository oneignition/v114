"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type ThemeType = "light" | "dark" | "system"

interface NotificationSettings {
  push: boolean
  email: boolean
  messages: boolean
  roseDonations: boolean
}

interface PrivacySettings {
  privateProfile: boolean
  showOnlineStatus: boolean
  allowFriendRequests: boolean
}

interface UserSettings {
  theme: ThemeType
  notifications: NotificationSettings
  privacy: PrivacySettings
}

interface SettingsContextType {
  settings: UserSettings
  updateTheme: (theme: ThemeType) => void
  updateNotificationSetting: (key: keyof NotificationSettings, value: boolean) => void
  updatePrivacySetting: (key: keyof PrivacySettings, value: boolean) => void
}

const defaultSettings: UserSettings = {
  theme: "light",
  notifications: {
    push: true,
    email: false,
    messages: true,
    roseDonations: true,
  },
  privacy: {
    privateProfile: false,
    showOnlineStatus: true,
    allowFriendRequests: true,
  },
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings)

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("userSettings")
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings))
      } catch (error) {
        console.error("Failed to parse settings:", error)
      }
    }
  }, [])

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("userSettings", JSON.stringify(settings))
  }, [settings])

  // Apply theme
  useEffect(() => {
    const root = window.document.documentElement

    if (settings.theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      root.classList.toggle("dark", systemTheme === "dark")
    } else {
      root.classList.toggle("dark", settings.theme === "dark")
    }
  }, [settings.theme])

  const updateTheme = (theme: ThemeType) => {
    setSettings((prev) => ({
      ...prev,
      theme,
    }))

    // In a real app, this would make an API call to update the user's settings
    console.log("Theme updated to:", theme)
  }

  const updateNotificationSetting = (key: keyof NotificationSettings, value: boolean) => {
    setSettings((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value,
      },
    }))

    // In a real app, this would make an API call to update the user's settings
    console.log(`Notification setting ${key} updated to:`, value)
  }

  const updatePrivacySetting = (key: keyof PrivacySettings, value: boolean) => {
    setSettings((prev) => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [key]: value,
      },
    }))

    // In a real app, this would make an API call to update the user's settings
    console.log(`Privacy setting ${key} updated to:`, value)
  }

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateTheme,
        updateNotificationSetting,
        updatePrivacySetting,
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider")
  }
  return context
}
