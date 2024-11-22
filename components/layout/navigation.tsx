"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"
import { 
  MoonIcon, SunIcon, Code, Layout, Layers, Box, 
  Smartphone, Globe, Palette, Search, Menu, X,
  User, Settings, LogOut, CreditCard, LifeBuoy
} from "lucide-react"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuContent,
} from "@/components/ui/navigation-menu"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ThemeToggle } from "@/components/theme-toggle"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { authService } from "@/lib/auth"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const { user } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await authService.signOut()
      toast.success("Signed out successfully")
      router.push('/sign-in')
    } catch (error) {
      toast.error("Failed to sign out")
    }
  }

  const AuthButton = () => {
    if (!user) {
      return (
        <Button
          className="hidden bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90 sm:flex"
          asChild
        >
          <Link href="/sign-up">Get Started</Link>
        </Button>
      )
    }

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
              <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.displayName || 'User'}</p>
              <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/dashboard">
              <User className="mr-2 h-4 w-4" />
              Dashboard
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/settings">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/billing">
              <CreditCard className="mr-2 h-4 w-4" />
              Billing
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <div className="fixed left-0 right-0 top-0 z-50 mx-auto max-w-7xl px-4 pt-4">
      <div className="rounded-2xl border border-black/10 bg-white/30 backdrop-blur-lg dark:border-white/10 dark:bg-black/30">
        <div className="flex h-16 items-center justify-between px-4 sm:px-8">
          {/* Left side - Logo */}
          <Link href={user ? "/dashboard" : "/"} className="flex items-center">
            <span className="text-xl font-bold tracking-tight text-black dark:text-white">
              Astroexture
            </span>
          </Link>

          {/* Center - Navigation (Hidden on mobile) */}
          <NavigationMenu className="mx-6 hidden lg:block">
            <NavigationMenuList className="space-x-2">
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent text-black hover:bg-black/5 hover:text-black data-[state=open]:bg-black/5 dark:text-white dark:hover:bg-white/5 dark:hover:text-white dark:data-[state=open]:bg-white/5">
                  Solutions
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid w-[500px] grid-cols-2 gap-2 rounded-lg border border-black/10 bg-white/80 p-4 backdrop-blur-lg dark:border-white/10 dark:bg-black/80">
                    {solutions.map((solution) => (
                      <Link
                        key={solution.title}
                        href={solution.href}
                        className="group flex items-start gap-4 rounded-lg p-3 text-black transition-colors hover:bg-black/5 dark:text-white dark:hover:bg-white/5"
                      >
                        <div className="rounded-lg bg-white/5 p-2">
                          <solution.icon className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-medium">{solution.title}</div>
                          <div className="mt-1 text-sm text-white/70 group-hover:text-white/90">
                            {solution.description}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent text-black hover:bg-black/5 hover:text-black data-[state=open]:bg-black/5 dark:text-white dark:hover:bg-white/5 dark:hover:text-white dark:data-[state=open]:bg-white/5">
                  Resources
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid w-[500px] gap-2 rounded-lg border border-black/10 bg-white/80 p-4 backdrop-blur-lg dark:border-white/10 dark:bg-black/80">
                    <div className="grid grid-cols-2 gap-4">
                      {resources.map((resource) => (
                        <Link
                          key={resource.title}
                          href={resource.href}
                          className="group flex items-start gap-4 rounded-lg p-3 text-black transition-colors hover:bg-black/5 dark:text-white dark:hover:bg-white/5"
                        >
                          <div className="rounded-lg bg-white/5 p-2">
                            <resource.icon className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="font-medium">{resource.title}</div>
                            <div className="mt-1 text-sm text-white/70 group-hover:text-white/90">
                              {resource.description}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                    <div className="mt-4 border-t border-black/10 pt-4 dark:border-white/10">
                      <div className="grid grid-cols-2 gap-4">
                        <Link 
                          href="#"
                          className="group flex items-center gap-2 text-sm text-black/70 hover:text-black dark:text-white dark:hover:text-white"
                        >
                          <span>Documentation</span>
                          <span className="text-xs text-black/50">→</span>
                        </Link>
                        <Link 
                          href="#"
                          className="group flex items-center gap-2 text-sm text-black/70 hover:text-black dark:text-white dark:hover:text-white"
                        >
                          <span>Case Studies</span>
                          <span className="text-xs text-black/50">→</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent text-black hover:bg-black/5 hover:text-black data-[state=open]:bg-black/5 dark:text-white dark:hover:bg-white/5 dark:hover:text-white dark:data-[state=open]:bg-white/5">
                  Company
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="flex w-[300px] flex-col gap-2 rounded-lg border border-black/10 bg-white/80 p-4 backdrop-blur-lg dark:border-white/10 dark:bg-black/80">
                    {company.map((item) => (
                      <Link
                        key={item.title}
                        href={item.href}
                        className="flex items-center gap-4 rounded-lg p-2 text-black transition-colors hover:bg-black/5 dark:text-white dark:hover:bg-white/5"
                      >
                        <item.icon className="h-5 w-5" />
                        <span>{item.title}</span>
                      </Link>
                    ))}
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {/* Right side - Search, Theme toggle, and Auth */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              className="hidden h-9 w-9 text-black hover:bg-black/5 dark:text-white dark:hover:bg-white/5 sm:flex"
            >
              <Search className="h-4 w-4" />
            </Button>
            <ThemeToggle />
            <AuthButton />

            {/* Mobile Menu Button */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 lg:hidden"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 bg-white/80 backdrop-blur-xl dark:bg-black/80">
                <div className="flex h-full flex-col">
                  <div className="flex-1 space-y-4 py-4">
                    {/* Mobile Solutions */}
                    <div className="px-2 py-4">
                      <h2 className="mb-2 text-lg font-semibold">Solutions</h2>
                      <div className="space-y-2">
                        {solutions.map((item) => (
                          <Link
                            key={item.title}
                            href={item.href}
                            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-black transition-colors hover:bg-black/5 dark:text-white dark:hover:bg-white/5"
                            onClick={() => setIsOpen(false)}
                          >
                            <item.icon className="h-4 w-4" />
                            {item.title}
                          </Link>
                        ))}
                      </div>
                    </div>

                    {/* Mobile Resources */}
                    <div className="px-2 py-4">
                      <h2 className="mb-2 text-lg font-semibold">Resources</h2>
                      <div className="space-y-2">
                        {resources.map((item) => (
                          <Link
                            key={item.title}
                            href={item.href}
                            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-black transition-colors hover:bg-black/5 dark:text-white dark:hover:bg-white/5"
                            onClick={() => setIsOpen(false)}
                          >
                            <item.icon className="h-4 w-4" />
                            {item.title}
                          </Link>
                        ))}
                      </div>
                    </div>

                    {/* Mobile Company */}
                    <div className="px-2 py-4">
                      <h2 className="mb-2 text-lg font-semibold">Company</h2>
                      <div className="space-y-2">
                        {company.map((item) => (
                          <Link
                            key={item.title}
                            href={item.href}
                            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-black transition-colors hover:bg-black/5 dark:text-white dark:hover:bg-white/5"
                            onClick={() => setIsOpen(false)}
                          >
                            <item.icon className="h-4 w-4" />
                            {item.title}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Mobile Bottom Actions */}
                  <div className="border-t border-black/10 p-4 dark:border-white/10">
                    <Button className="w-full" asChild>
                      <Link href="/sign-up" onClick={() => setIsOpen(false)}>
                        Get Started
                      </Link>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </div>
  )
}
const solutions = [
  {
    title: "Web Development",
    description: "Custom websites and web applications",
    href: "#",
    icon: Code,
  },
  {
    title: "UI/UX Design",
    description: "User-centered design solutions",
    href: "#",
    icon: Layout,
  },
  {
    title: "E-commerce",
    description: "Online store development",
    href: "#",
    icon: Box,
  },
  {
    title: "Mobile Apps",
    description: "Cross-platform mobile solutions",
    href: "#",
    icon: Smartphone,
  },
]

const resources = [
  {
    title: "Developer Hub",
    description: "Documentation and guides",
    href: "#",
    icon: Globe,
  },
  {
    title: "Design System",
    description: "Components and guidelines",
    href: "#",
    icon: Palette,
  },
  {
    title: "Templates",
    description: "Pre-built website templates",
    href: "#",
    icon: Layout,
  },
  {
    title: "API Reference",
    description: "Integration guides and docs",
    href: "#",
    icon: Layers,
  },
]

const company = [
  {
    title: "About Us",
    href: "#",
    icon: Globe,
  },
  {
    title: "Blog",
    href: "#",
    icon: Layout,
  },
  {
    title: "Careers",
    href: "#",
    icon: Layers,
  },
  {
    title: "Contact",
    href: "#",
    icon: Box,
  },
]
