// app/dashboard/layout.tsx
"use client"

import { useState } from "react"
import { 
  LayoutDashboard, 
  FileCode, 
  Settings, 
  MessageSquare,
  Bell,
  User,
  FolderKanban,
  PanelLeft,
  LogOut,
  Plus
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/useAuth"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

const sidebarLinks = [
  {
    title: "Overview",
    icon: LayoutDashboard,
    href: "/dashboard",
    badge: null
  },
  {
    title: "Projects",
    icon: FileCode,
    href: "/dashboard/projects",
    badge: "3"
  },
  {
    title: "Tasks",
    icon: FolderKanban,
    href: "/dashboard/tasks",
    badge: "5"
  },
  {
    title: "Messages",
    icon: MessageSquare,
    href: "/dashboard/messages",
    badge: "2"
  },
  {
    title: "Settings",
    icon: Settings,
    href: "/dashboard/settings",
    badge: null
  }
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const pathname = usePathname()
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 dark:from-black dark:to-gray-900">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-black/10 bg-white/80 backdrop-blur-xl transition-all dark:border-white/10 dark:bg-black/80",
          isSidebarCollapsed ? "w-20" : "w-72"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-black/10 px-6 dark:border-white/10">
          <Link href="/dashboard" className="flex items-center gap-2">
            {!isSidebarCollapsed && (
              <span className="text-xl font-bold">Astroexture</span>
            )}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          >
            <PanelLeft className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-colors hover:bg-black/5 hover:text-black dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white",
                  isActive && "bg-black/5 text-black dark:bg-white/5 dark:text-white"
                )}
              >
                <link.icon className="h-5 w-5" />
                {!isSidebarCollapsed && (
                  <>
                    <span>{link.title}</span>
                    {link.badge && (
                      <Badge
                        className="ml-auto bg-black text-white dark:bg-white dark:text-black"
                      >
                        {link.badge}
                      </Badge>
                    )}
                  </>
                )}
              </Link>
            )
          })}

          <Button 
            className="mt-6 w-full bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
          >
            {isSidebarCollapsed ? (
              <Plus className="h-4 w-4" />
            ) : (
              <span className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                New Project
              </span>
            )}
          </Button>
        </nav>

        {/* User Section */}
        <div className="border-t border-black/10 p-4 dark:border-white/10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start gap-2"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.photoURL || ''} />
                  <AvatarFallback>
                    {user?.email?.[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {!isSidebarCollapsed && (
                  <div className="flex flex-1 items-center justify-between">
                    <div className="text-left">
                      <p className="text-sm font-medium">
                        {user?.displayName || 'User'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell className="mr-2 h-4 w-4" />
                Notifications
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600 dark:text-red-400">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main Content */}
      <main className={cn(
        "min-h-screen transition-all",
        isSidebarCollapsed ? "pl-20" : "pl-72"
      )}>
        {children}
      </main>
    </div>
  )
}