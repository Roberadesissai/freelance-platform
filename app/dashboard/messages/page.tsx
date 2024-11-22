// app/dashboard/messages/page.tsx
"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  getDoc,
  doc,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/hooks/useAuth"
import { format } from "date-fns"
import { Send, Search, Phone, Video, MoreVertical, ArrowLeft } from "lucide-react"

interface Message {
  id: string
  content: string
  senderId: string
  receiverId: string
  timestamp: Date
  read: boolean
}

interface ChatUser {
  id: string
  name: string
  email: string
  avatar?: string
  online: boolean
  lastSeen?: Date
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [users, setUsers] = useState<ChatUser[]>([])
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const { user } = useAuth()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Fetch available users
  useEffect(() => {
    if (!user) return

    const q = query(
      collection(db, "users"),
      where("id", "!=", user.uid)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const userData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as ChatUser[]
      setUsers(userData)
    })

    return () => unsubscribe()
  }, [user])

  // Fetch messages for selected chat
  useEffect(() => {
    if (!user || !selectedUser) return

    const q = query(
      collection(db, "messages"),
      where("participants", "array-contains", user.uid),
      orderBy("timestamp", "asc")
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messageData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate(),
      })) as Message[]
      setMessages(messageData)
      scrollToBottom()
    })

    return () => unsubscribe()
  }, [user, selectedUser])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !selectedUser || !newMessage.trim()) return

    try {
      await addDoc(collection(db, "messages"), {
        content: newMessage,
        senderId: user.uid,
        receiverId: selectedUser.id,
        participants: [user.uid, selectedUser.id],
        timestamp: serverTimestamp(),
        read: false,
      })

      setNewMessage("")
    } catch (error) {
      console.error("Error sending message:", error)
    }
  }

  return (
    <div className="h-[calc(100vh-24px)] pt-32 px-4 max-w-[1400px] mx-auto">
      <div className="flex h-[calc(100vh-10rem)] gap-2">
        {/* Users List - Hidden when chat is open on mobile */}
        <div className={`${
          selectedUser ? 'hidden md:block' : 'w-full'
        } md:w-80 flex-shrink-0 rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950`}>
          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <Input
                placeholder="Search conversations..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <ScrollArea className="h-[calc(100vh-16rem)]">
            <div className="space-y-2 p-4">
              {users
                .filter(u => 
                  u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  u.email.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((chatUser) => (
                  <button
                    key={chatUser.id}
                    className={`flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 ${
                      selectedUser?.id === chatUser.id ? 'bg-gray-100 dark:bg-gray-800' : ''
                    }`}
                    onClick={() => setSelectedUser(chatUser)}
                  >
                    <div className="relative">
                      <Avatar>
                        <AvatarImage src={chatUser.avatar} />
                        <AvatarFallback>
                          {chatUser.name[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {chatUser.online && (
                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 ring-2 ring-white dark:ring-gray-950" />
                      )}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <h3 className="font-medium">{chatUser.name}</h3>
                      <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                        {chatUser.email}
                      </p>
                    </div>
                  </button>
                ))}
            </div>
          </ScrollArea>
        </div>

        {/* Chat Area - Full screen on mobile when chat is selected */}
        {selectedUser ? (
          <div className={`${
            selectedUser ? 'fixed md:relative inset-0 md:inset-auto' : 'hidden'
          } flex flex-1 flex-col rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950 md:flex`}>
            {/* Chat Header with Back Button for Mobile */}
            <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="md:hidden mr-2"
                  onClick={() => setSelectedUser(null)}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Avatar>
                  <AvatarImage src={selectedUser.avatar} />
                  <AvatarFallback>{selectedUser.name[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-medium">{selectedUser.name}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedUser.online ? (
                      <span className="text-green-500">Online</span>
                    ) : (
                      `Last seen ${
                        selectedUser.lastSeen 
                          ? format(selectedUser.lastSeen, 'MMM d, h:mm a')
                          : 'Never'
                      }`
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Video className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.senderId === user?.uid ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`rounded-lg px-4 py-2 ${
                        message.senderId === user?.uid
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-800'
                      }`}
                    >
                      <p>{message.content}</p>
                      <span className="mt-1 text-xs opacity-70">
                        {format(message.timestamp, 'h:mm a')}
                      </span>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <form onSubmit={sendMessage} className="border-t border-gray-200 p-4 dark:border-gray-800">
              <div className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <Button type="submit">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </div>
        ) : (
          // Empty state for mobile when no chat is selected
          <div className="hidden md:flex md:flex-1 items-center justify-center rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
            <div className="text-center">
              <h2 className="text-xl font-medium">Select a conversation</h2>
              <p className="text-gray-500 dark:text-gray-400">
                Choose a user from the list to start chatting
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}