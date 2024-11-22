// lib/presence.ts
import { db } from '@/lib/firebase'
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { getDatabase, ref, onDisconnect } from 'firebase/database'

export class PresenceSystem {
  private userId: string
  private userRef: any
  private rtdbRef: any

  constructor(userId: string) {
    this.userId = userId
    this.userRef = doc(db, 'users', userId)
    this.rtdbRef = ref(getDatabase(), `status/${userId}`)
  }

  async initialize() {
    // Set user as online in Firestore
    await updateDoc(this.userRef, {
      online: true,
      lastSeen: serverTimestamp()
    })

    // Set up disconnect hook in Realtime Database
    onDisconnect(this.rtdbRef).set({
      online: false,
      lastSeen: serverTimestamp()
    })
  }

  async cleanup() {
    await updateDoc(this.userRef, {
      online: false,
      lastSeen: serverTimestamp()
    })
  }
}

// Hook to manage presence
export function usePresence(userId: string | undefined) {
  const { useEffect } = require('react')
  useEffect(() => {
    if (!userId) return

    const presence = new PresenceSystem(userId)
    presence.initialize()

    return () => {
      presence.cleanup()
    }
  }, [userId])
}