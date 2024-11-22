"use client"

import { useEffect } from "react"
import { useTheme } from "@/hooks/useTheme"

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme()

  useEffect(() => {
    const root = window.document.documentElement

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light"
      root.classList.toggle("dark", systemTheme === "dark")
    } else {
      root.classList.toggle("dark", theme === "dark")
    }
  }, [theme])

  return children
}
