// app/dashboard/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { db } from "@/lib/firebase"
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { 
  Rocket, 
  Code, 
  ShoppingBag, 
  Layout, 
  Plus, 
  Clock,
  AlertCircle,
  CheckCircle,
  ArrowRight
} from "lucide-react"

interface Project {
  id: string
  type: string
  name: string
  description: string
  status: 'pending' | 'in_progress' | 'completed'
  progress: number
  createdAt: Date
  deadline: Date
  budget: number
  requirements: string[]
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [activeTab, setActiveTab] = useState("overview")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    // Subscribe to real-time project updates
    const projectsRef = collection(db, "projects")
    const q = query(
      projectsRef,
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const projectData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Project[]
      setProjects(projectData)
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [user])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/10 text-green-500'
      case 'in_progress':
        return 'bg-blue-500/10 text-blue-500'
      default:
        return 'bg-orange-500/10 text-orange-500'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Welcome, {user?.displayName || user?.email}
          </h1>
          <p className="mt-3 text-xl text-gray-400">
            Track your web development projects and start new ones
          </p>
        </div>

        {/* Main Content */}
        <Tabs 
          defaultValue="overview" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="space-y-8"
        >
          <div className="flex justify-center">
            <TabsList className="grid w-full max-w-[600px] grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="projects">Projects</TabsTrigger>
              <TabsTrigger value="new">Start New</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-8">
            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="bg-black/50 backdrop-blur-lg border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="rounded-full bg-blue-500/10 p-3">
                      <Code className="h-6 w-6 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-400">Active Projects</p>
                      <h3 className="text-2xl font-bold text-white">
                        {projects.filter(p => p.status === 'in_progress').length}
                      </h3>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/50 backdrop-blur-lg border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="rounded-full bg-green-500/10 p-3">
                      <CheckCircle className="h-6 w-6 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-400">Completed</p>
                      <h3 className="text-2xl font-bold text-white">
                        {projects.filter(p => p.status === 'completed').length}
                      </h3>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/50 backdrop-blur-lg border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="rounded-full bg-orange-500/10 p-3">
                      <Clock className="h-6 w-6 text-orange-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-400">Pending</p>
                      <h3 className="text-2xl font-bold text-white">
                        {projects.filter(p => p.status === 'pending').length}
                      </h3>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Projects */}
            <Card className="bg-black/50 backdrop-blur-lg border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Recent Projects</CardTitle>
                <CardDescription className="text-gray-400">
                  Your latest web development projects
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {projects.slice(0, 3).map((project) => (
                    <div
                      key={project.id}
                      className="flex items-center justify-between rounded-lg border border-white/10 p-4"
                    >
                      <div className="space-y-1">
                        <p className="font-medium text-white">{project.name}</p>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(project.status)}>
                            {project.status.replace('_', ' ')}
                          </Badge>
                          <span className="text-sm text-gray-400">
                            Due {new Date(project.deadline).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="w-40">
                          <Progress value={project.progress} className="h-2" />
                        </div>
                        <span className="text-sm font-medium text-white">
                          {project.progress}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projects" className="space-y-6">
            <div className="grid gap-6">
              {projects.map((project) => (
                <Card 
                  key={project.id}
                  className="bg-black/50 backdrop-blur-lg border-white/10"
                >
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-bold text-white">
                            {project.name}
                          </h3>
                          <p className="text-gray-400">{project.description}</p>
                        </div>
                        <Badge className={getStatusColor(project.status)}>
                          {project.status.replace('_', ' ')}
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Progress</span>
                          <span className="text-white">{project.progress}%</span>
                        </div>
                        <Progress value={project.progress} className="h-2" />
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm">
                        <div>
                          <p className="text-gray-400">Budget</p>
                          <p className="font-medium text-white">
                            ${project.budget.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400">Deadline</p>
                          <p className="font-medium text-white">
                            {new Date(project.deadline).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <Button 
                        className="w-full"
                        onClick={() => {
                          // Implement project details view
                        }}
                      >
                        View Details
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="new">
            {/* Implement project creation wizard */}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}