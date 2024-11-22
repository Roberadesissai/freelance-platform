// app/dashboard/projects/[id]/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Calendar,
  Clock,
  MessageSquare,
  Plus,
  Target,
  Users,
  FileText,
  Settings,
  CheckCircle2,
  AlertCircle
} from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { db } from "@/lib/firebase"
import { 
  doc, 
  getDoc, 
  updateDoc, 
  collection, 
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp
} from "firebase/firestore"
import { format } from "date-fns"
import { toast } from "sonner"

interface Milestone {
  id: string
  title: string
  description: string
  dueDate: Date
  completed: boolean
  progress: number
}

interface Comment {
  id: string
  text: string
  userId: string
  userName: string
  userAvatar?: string
  createdAt: Date
}

export default function ProjectDetailsPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const [project, setProject] = useState<any>(null)
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedTab, setSelectedTab] = useState("overview")

  // Fetch project details
  useEffect(() => {
    if (!id || !user) return

    const unsubscribe = onSnapshot(doc(db, "projects", id as string), (doc) => {
      if (doc.exists()) {
        setProject({ id: doc.id, ...doc.data() })
      }
    })

    return () => unsubscribe()
  }, [id, user])

  // Fetch milestones
  useEffect(() => {
    if (!id || !user) return

    const q = query(
      collection(db, "milestones"),
      where("projectId", "==", id),
      orderBy("dueDate")
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const milestoneData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        dueDate: doc.data().dueDate.toDate()
      })) as Milestone[]
      setMilestones(milestoneData)
    })

    return () => unsubscribe()
  }, [id, user])

  // Fetch comments
  useEffect(() => {
    if (!id || !user) return

    const q = query(
      collection(db, "comments"),
      where("projectId", "==", id),
      orderBy("createdAt", "desc")
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const commentData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate()
      })) as Comment[]
      setComments(commentData)
    })

    return () => unsubscribe()
  }, [id, user])

  const addMilestone = async (data: Partial<Milestone>) => {
    try {
      setIsLoading(true)
      await addDoc(collection(db, "milestones"), {
        ...data,
        projectId: id,
        completed: false,
        progress: 0,
        createdAt: serverTimestamp()
      })
      toast.success("Milestone added successfully")
    } catch (error) {
      toast.error("Failed to add milestone")
    } finally {
      setIsLoading(false)
    }
  }

  const updateMilestone = async (milestoneId: string, data: Partial<Milestone>) => {
    try {
      await updateDoc(doc(db, "milestones", milestoneId), {
        ...data,
        updatedAt: serverTimestamp()
      })
      toast.success("Milestone updated successfully")
    } catch (error) {
      toast.error("Failed to update milestone")
    }
  }

  const addComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    try {
      await addDoc(collection(db, "comments"), {
        projectId: id,
        text: newComment,
        userId: user?.uid,
        userName: user?.displayName || user?.email,
        userAvatar: user?.photoURL,
        createdAt: serverTimestamp()
      })
      setNewComment("")
    } catch (error) {
      toast.error("Failed to add comment")
    }
  }

  if (!project) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>
  }

  return (
    <div className="container py-8">
      {/* Project Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{project.name}</h1>
            <p className="text-gray-500">{project.description}</p>
          </div>
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Project Settings
          </Button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900">
                <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium">Progress</p>
                <p className="text-2xl font-bold">{project.progress}%</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-full bg-green-100 p-3 dark:bg-green-900">
                <Calendar className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium">Due Date</p>
                <p className="text-2xl font-bold">
                  {format(new Date(project.deadline), 'MMM d')}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900">
                <Target className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-medium">Milestones</p>
                <p className="text-2xl font-bold">
                  {milestones.filter(m => m.completed).length}/{milestones.length}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-full bg-orange-100 p-3 dark:bg-orange-900">
                <MessageSquare className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm font-medium">Comments</p>
                <p className="text-2xl font-bold">{comments.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
          <TabsTrigger value="discussion">Discussion</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Project Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <Badge className={
                      project.status === 'completed' ? 'bg-green-500' :
                      project.status === 'in_progress' ? 'bg-blue-500' :
                      'bg-orange-500'
                    }>
                      {project.status}
                    </Badge>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-500">Project Type</p>
                    <p>{project.type}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-500">Budget</p>
                    <p>${project.budget.toLocaleString()}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-500">Progress</p>
                    <Progress value={project.progress} className="mt-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Add activity feed here */}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="milestones" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Project Milestones</CardTitle>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Milestone
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {milestones.map((milestone) => (
                  <div
                    key={milestone.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{milestone.title}</h3>
                        {milestone.completed ? (
                          <Badge className="bg-green-500">Completed</Badge>
                        ) : (
                          <Badge className="bg-blue-500">In Progress</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{milestone.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {format(milestone.dueDate, 'MMM d, yyyy')}
                        </div>
                        <div className="flex items-center gap-1">
                          <Target className="h-4 w-4" />
                          {milestone.progress}% Complete
                        </div>
                      </div>
                    </div>
                    <Progress value={milestone.progress} className="w-32" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="files" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Files</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Add file upload and management here */}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="discussion" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Discussion</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-4">
                    <Avatar>
                      <AvatarImage src={comment.userAvatar} />
                      <AvatarFallback>
                        {comment.userName[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{comment.userName}</p>
                        <span className="text-sm text-gray-500">
                          {format(comment.createdAt, 'MMM d, h:mm a')}
                        </span>
                      </div>
                      <p className="mt-1 text-gray-700 dark:text-gray-300">
                        {comment.text}
                      </p>
                    </div>
                  </div>
                ))}

                <form onSubmit={addComment} className="mt-6">
                  <div className="flex gap-4">
                    <Avatar>
                      <AvatarImage src={user?.photoURL || ''} />
                      <AvatarFallback>
                        {user?.email?.[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <Textarea
                        placeholder="Add a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="mb-2"
                      />
                      <Button type="submit">Post Comment</Button>
                    </div>
                  </div>
                </form>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}