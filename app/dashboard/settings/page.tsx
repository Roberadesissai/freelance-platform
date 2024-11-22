// app/dashboard/settings/page.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Bell, 
  Moon, 
  Sun,
  Globe,
  Shield,
  Mail,
  Clock,
  Laptop,
  MessageSquare,
  Activity,
  Trash2,
  Settings,
  Eye,
  Settings2
} from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/hooks/useAuth"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface UserSettings {
  theme: 'light' | 'dark' | 'system'
  language: string
  timezone: string
  emailNotifications: {
    projectUpdates: boolean
    teamMessages: boolean
    systemAnnouncements: boolean
    weeklyDigest: boolean
  }
  desktopNotifications: {
    enabled: boolean
    sound: boolean
    taskReminders: boolean
    deadlineAlerts: boolean
  }
  privacy: {
    showOnlineStatus: boolean
    showLastSeen: boolean
    showEmail: boolean
  }
  accessibility: {
    reducedMotion: boolean
    highContrast: boolean
    largeText: boolean
  }
}

export default function SettingsPage() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [settings, setSettings] = useState<UserSettings>({
    theme: 'system',
    language: 'en',
    timezone: 'UTC',
    emailNotifications: {
      projectUpdates: true,
      teamMessages: true,
      systemAnnouncements: true,
      weeklyDigest: false
    },
    desktopNotifications: {
      enabled: true,
      sound: true,
      taskReminders: true,
      deadlineAlerts: true
    },
    privacy: {
      showOnlineStatus: true,
      showLastSeen: true,
      showEmail: false
    },
    accessibility: {
      reducedMotion: false,
      highContrast: false,
      largeText: false
    }
  })
  const [activeSection, setActiveSection] = useState("general")

  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    if (!user) return

    try {
      setIsLoading(true)
      const updatedSettings = { ...settings, ...newSettings }
      await updateDoc(doc(db, "userSettings", user.uid), updatedSettings)
      setSettings(updatedSettings)
      toast.success("Settings updated successfully")
    } catch (error) {
      toast.error("Failed to update settings")
    } finally {
      setIsLoading(false)
    }
  }

  const exportData = async () => {
    try {
      setIsLoading(true)
      // Implement data export logic
      toast.success("Data exported successfully")
    } catch (error) {
      toast.error("Failed to export data")
    } finally {
      setIsLoading(false)
    }
  }

  const deleteAccount = async () => {
    try {
      setIsLoading(true)
      // Implement account deletion logic
      toast.success("Account deleted successfully")
    } catch (error) {
      toast.error("Failed to delete account")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="h-[calc(100vh-24px)] pt-32 px-4 max-w-[1400px] mx-auto overflow-y-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold md:text-3xl">Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 md:text-base">
          Manage your application preferences
        </p>
      </div>

      {/* Mobile View: Dropdown for sections */}
      <div className="block md:hidden mb-6">
        <Select 
          value={activeSection}
          onValueChange={setActiveSection}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select section" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="general">General</SelectItem>
            <SelectItem value="notifications">Notifications</SelectItem>
            <SelectItem value="privacy">Privacy</SelectItem>
            <SelectItem value="accessibility">Accessibility</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Desktop View: Original Tabs */}
      <Tabs value={activeSection} onValueChange={setActiveSection} className="space-y-6">
        <TabsList className="hidden md:flex flex-wrap gap-2 md:flex-nowrap">
          <TabsTrigger value="general" className="flex-1">General</TabsTrigger>
          <TabsTrigger value="notifications" className="flex-1">Notifications</TabsTrigger>
          <TabsTrigger value="privacy" className="flex-1">Privacy</TabsTrigger>
          <TabsTrigger value="accessibility" className="flex-1">Accessibility</TabsTrigger>
          <TabsTrigger value="advanced" className="flex-1">Advanced</TabsTrigger>
        </TabsList>

        <div className="space-y-6">
          <TabsContent value={activeSection}>
            {activeSection === "general" && (
              <Card className="p-4 md:p-6">
                <h2 className="text-lg font-medium mb-4">Appearance</h2>
                <div className="space-y-6">
                  {/* Theme Settings */}
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-0.5">
                      <Label>Theme</Label>
                      <p className="text-sm text-gray-500">Select your preferred theme</p>
                    </div>
                    <Select 
                      defaultValue={settings.theme}
                      onValueChange={(value) => updateSettings({ theme: value as 'light' | 'dark' | 'system' })}
                    >
                      <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">
                          <div className="flex items-center">
                            <Sun className="mr-2 h-4 w-4" />
                            Light
                          </div>
                        </SelectItem>
                        <SelectItem value="dark">
                          <div className="flex items-center">
                            <Moon className="mr-2 h-4 w-4" />
                            Dark
                          </div>
                        </SelectItem>
                        <SelectItem value="system">
                          <div className="flex items-center">
                            <Laptop className="mr-2 h-4 w-4" />
                            System
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Language Settings */}
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-0.5">
                      <Label>Language</Label>
                      <p className="text-sm text-gray-500">Choose your preferred language</p>
                    </div>
                    <Select 
                      defaultValue={settings.language}
                      onValueChange={(value) => updateSettings({ language: value })}
                    >
                      <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Timezone Settings */}
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-0.5">
                      <Label>Timezone</Label>
                      <p className="text-sm text-gray-500">Set your local timezone</p>
                    </div>
                    <Select 
                      defaultValue={settings.timezone}
                      onValueChange={(value) => updateSettings({ timezone: value })}
                    >
                      <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="EST">Eastern Time</SelectItem>
                        <SelectItem value="PST">Pacific Time</SelectItem>
                        <SelectItem value="GMT">GMT</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Card>
            )}
            {activeSection === "notifications" && (
              <div className="space-y-6">
                <Card className="p-4 md:p-6">
                  <h2 className="text-lg font-medium mb-4">Email Notifications</h2>
                  <div className="space-y-6">
                    {Object.entries(settings.emailNotifications).map(([key, value]) => (
                      <div key={key} className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-0.5">
                          <Label>{key.replace(/([A-Z])/g, ' $1').trim()}</Label>
                          <p className="text-sm text-gray-500">
                            Receive email notifications for {key.toLowerCase()}
                          </p>
                        </div>
                        <Switch
                          checked={value}
                          onCheckedChange={(checked) => 
                            updateSettings({
                              emailNotifications: {
                                ...settings.emailNotifications,
                                [key]: checked
                              }
                            })
                          }
                        />
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}
            {activeSection === "privacy" && (
              <div className="space-y-6">
                <Card className="p-4 md:p-6">
                  <h2 className="text-lg font-medium mb-4">Privacy Settings</h2>
                  <div className="space-y-6">
                    {Object.entries(settings.privacy).map(([key, value]) => (
                      <div key={key} className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-0.5">
                          <Label>{key.replace(/([A-Z])/g, ' $1').trim()}</Label>
                          <p className="text-sm text-gray-500">
                            Allow others to see your {key.toLowerCase()}
                          </p>
                        </div>
                        <Switch
                          checked={value}
                          onCheckedChange={(checked) => 
                            updateSettings({
                              privacy: {
                                ...settings.privacy,
                                [key]: checked
                              }
                            })
                          }
                        />
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}
            {activeSection === "accessibility" && (
              <Card className="p-4 md:p-6">
                <h2 className="text-lg font-medium mb-4">Accessibility Settings</h2>
                <div className="space-y-6">
                  {Object.entries(settings.accessibility).map(([key, value]) => (
                    <div key={key} className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div className="space-y-0.5">
                        <Label>{key.replace(/([A-Z])/g, ' $1').trim()}</Label>
                        <p className="text-sm text-gray-500">
                          {key === 'reducedMotion'
                            ? 'Reduce motion and animations'
                            : key === 'highContrast'
                            ? 'Increase contrast for better visibility'
                            : 'Use larger text throughout the application'
                          }
                        </p>
                      </div>
                      <Switch
                        checked={value}
                        onCheckedChange={(checked) => 
                          updateSettings({
                            accessibility: {
                              ...settings.accessibility,
                              [key]: checked
                            }
                          })
                        }
                      />
                    </div>
                  ))}
                </div>
              </Card>
            )}
            {activeSection === "advanced" && (
              <div className="space-y-6">
                <Card className="p-4 md:p-6">
                  <h2 className="text-lg font-medium mb-4">Data Management</h2>
                  <div className="space-y-6">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={exportData}
                      disabled={isLoading}
                    >
                      Export All Data
                    </Button>
                    <p className="text-sm text-gray-500">
                      Download a copy of all your data in JSON format
                    </p>
                  </div>
                </Card>

                <Card className="border-red-200 p-4 md:p-6 dark:border-red-800">
                  <h2 className="text-lg font-medium text-red-600 dark:text-red-400">
                    Danger Zone
                  </h2>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Button 
                        variant="destructive" 
                        className="w-full"
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                            deleteAccount()
                          }
                        }}
                        disabled={isLoading}
                      >
                        Delete Account
                      </Button>
                      <p className="text-sm text-red-600 dark:text-red-400">
                        Once you delete your account, there is no going back. Please be certain.
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}