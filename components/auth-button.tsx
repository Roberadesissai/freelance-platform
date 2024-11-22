"use client"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"

export function AuthButton() {
  const { user, signInWithGoogle, signOut } = useAuth()

  return (
    <>
      {user ? (
        <Button 
          variant="ghost" 
          onClick={() => signOut()}
        >
          Sign Out
        </Button>
      ) : (
        <Button 
          variant="default"
          onClick={() => signInWithGoogle()}
        >
          Sign In with Google
        </Button>
      )}
    </>
  )
}