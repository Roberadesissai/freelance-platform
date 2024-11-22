// contexts/AuthContext.tsx
"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { auth } from '@/lib/firebase'
import { onAuthStateChanged, User } from 'firebase/auth'
import { useRouter, usePathname } from 'next/navigation'
import { Loader2 } from 'lucide-react'

interface AuthContextType {
  user: User | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
})

const PUBLIC_ROUTES = ['/sign-in', '/sign-up', '/forgot-password']

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)

      if (!user && !PUBLIC_ROUTES.includes(pathname)) {
        router.push('/sign-in')
      } else if (user && PUBLIC_ROUTES.includes(pathname)) {
        router.push('/dashboard')
      }
    })

    return () => unsubscribe()
  }, [pathname])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)