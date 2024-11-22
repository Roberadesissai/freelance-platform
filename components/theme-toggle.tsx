// components/theme-toggle.tsx
"use client"

import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { SunIcon, MoonIcon } from "lucide-react"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-9 w-9 rounded-lg border border-black/10 bg-white/50 text-black hover:bg-white/80 hover:text-black dark:border-white/10 dark:bg-black/50 dark:text-white dark:hover:bg-black/80 dark:hover:text-white"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      <SunIcon className="h-4 w-4 rotate-0 scale-100 transition-all duration-200 dark:-rotate-90 dark:scale-0" />
      <MoonIcon className="absolute h-4 w-4 rotate-90 scale-0 transition-all duration-200 dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}