import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Navigation from "@/components/layout/navigation"
import { ThemeProvider } from "@/components/providers/theme-provider"
const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "DevServices - Custom Web Development",
  description: "Professional web development services for your business",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <Navigation />
          <main className="min-h-screen">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  )
}