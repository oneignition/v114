"use client"

import { Settings, Bell, Lock, Moon, Sun, LogOut, User, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"
import { useAuth } from "@/contexts/auth-context"
import { useSettings } from "@/contexts/settings-context"
import { useRouter } from "next/navigation"

export function SettingsMenu() {
  const { user, logout, updateUser } = useAuth()
  const { settings, updateTheme, updateNotificationSetting, updatePrivacySetting } = useSettings()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const toggleProfileVisibility = (checked: boolean) => {
    if (!user) return

    updateUser({
      profileVisibility: {
        ...user.profileVisibility,
        showVisitors: checked,
      },
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel>Settings</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => router.push("/profile")}>
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Bell className="mr-2 h-4 w-4" />
              <span>Notifications</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent className="w-56">
                <DropdownMenuItem className="flex items-center justify-between">
                  <span>Push Notifications</span>
                  <Switch
                    checked={settings.notifications.push}
                    onCheckedChange={(checked) => updateNotificationSetting("push", checked)}
                  />
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center justify-between">
                  <span>Email Notifications</span>
                  <Switch
                    checked={settings.notifications.email}
                    onCheckedChange={(checked) => updateNotificationSetting("email", checked)}
                  />
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center justify-between">
                  <span>Message Notifications</span>
                  <Switch
                    checked={settings.notifications.messages}
                    onCheckedChange={(checked) => updateNotificationSetting("messages", checked)}
                  />
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center justify-between">
                  <span>Rose Donations</span>
                  <Switch
                    checked={settings.notifications.roseDonations}
                    onCheckedChange={(checked) => updateNotificationSetting("roseDonations", checked)}
                  />
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Lock className="mr-2 h-4 w-4" />
              <span>Privacy</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent className="w-56">
                <DropdownMenuItem className="flex items-center justify-between">
                  <span>Private Profile</span>
                  <Switch
                    checked={settings.privacy.privateProfile}
                    onCheckedChange={(checked) => updatePrivacySetting("privateProfile", checked)}
                  />
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center justify-between">
                  <span>Show Online Status</span>
                  <Switch
                    checked={settings.privacy.showOnlineStatus}
                    onCheckedChange={(checked) => updatePrivacySetting("showOnlineStatus", checked)}
                  />
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center justify-between">
                  <span>Allow Friend Requests</span>
                  <Switch
                    checked={settings.privacy.allowFriendRequests}
                    onCheckedChange={(checked) => updatePrivacySetting("allowFriendRequests", checked)}
                  />
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center justify-between">
                  <span>Profile Visit Visibility</span>
                  <Switch
                    checked={user?.profileVisibility?.showVisitors ?? true}
                    onCheckedChange={toggleProfileVisibility}
                  />
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              {settings.theme === "dark" ? <Moon className="mr-2 h-4 w-4" /> : <Sun className="mr-2 h-4 w-4" />}
              <span>Appearance</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent className="w-56">
                <DropdownMenuItem onClick={() => updateTheme("light")}>
                  <Sun className="mr-2 h-4 w-4" />
                  <span>Light</span>
                  {settings.theme === "light" && <span className="ml-auto">✓</span>}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => updateTheme("dark")}>
                  <Moon className="mr-2 h-4 w-4" />
                  <span>Dark</span>
                  {settings.theme === "dark" && <span className="ml-auto">✓</span>}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => updateTheme("system")}>
                  <span className="mr-2">💻</span>
                  <span>System</span>
                  {settings.theme === "system" && <span className="ml-auto">✓</span>}
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => router.push("/about")}>
          <HelpCircle className="mr-2 h-4 w-4" />
          <span>Help & Support</span>
        </DropdownMenuItem>

        {user && (
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
