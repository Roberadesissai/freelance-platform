// contexts/NotificationContext.tsx
"use client"

import { createContext, useContext, useState, useEffect } from 'react'
import { onSnapshot, collection, query, where, orderBy, writeBatch, doc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/hooks/useAuth'

interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  createdAt: Date
}

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
}

const NotificationContext = createContext<NotificationContextType>({} as NotificationContextType)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return

    const q = query(
      collection(db, `users/${user.uid}/notifications`),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Notification[]
      setNotifications(notifs)
    })

    return () => unsubscribe()
  }, [user])

  const unreadCount = notifications.filter(n => !n.read).length

  const markAsRead = async (id: string) => {
    if (!user) return
    await updateDoc(doc(db, `users/${user.uid}/notifications/${id}`), {
      read: true
    })
  }

  const markAllAsRead = async () => {
    if (!user) return
    const batch = writeBatch(db)
    notifications
      .filter(n => !n.read)
      .forEach(n => {
        const ref = doc(db, `users/${user.uid}/notifications/${n.id}`)
        batch.update(ref, { read: true })
      })
    await batch.commit()
  }

  return (
    <NotificationContext.Provider 
      value={{ 
        notifications, 
        unreadCount, 
        markAsRead, 
        markAllAsRead 
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotifications = () => useContext(NotificationContext)