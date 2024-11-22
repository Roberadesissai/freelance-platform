// app/dashboard/tasks/page.tsx
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd"
import { Plus, MoreVertical, Clock, User } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { db } from "@/lib/firebase"
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  deleteDoc 
} from "firebase/firestore"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "sonner"
import { format } from "date-fns"

interface Task {
  id: string
  title: string
  description: string
  status: "todo" | "in_progress" | "completed"
  priority: "low" | "medium" | "high"
  projectId: string
  assignedTo: string
  dueDate: Date
  createdAt: Date
}

const statusColumns = {
  todo: { title: "To Do", color: "bg-gray-500" },
  in_progress: { title: "In Progress", color: "bg-blue-500" },
  completed: { title: "Completed", color: "bg-green-500" },
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()
  const [projects, setProjects] = useState<any[]>([])

  // Fetch tasks
  useEffect(() => {
    if (!user) return

    const q = query(
      collection(db, "tasks"),
      where("assignedTo", "==", user.uid),
      orderBy("createdAt", "desc")
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const taskData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        dueDate: doc.data().dueDate?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
      })) as Task[]
      setTasks(taskData)
    })

    return () => unsubscribe()
  }, [user])

  // Fetch projects for task creation
  useEffect(() => {
    if (!user) return

    const q = query(
      collection(db, "projects"),
      where("userId", "==", user.uid)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const projectData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setProjects(projectData)
    })

    return () => unsubscribe()
  }, [user])

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return

    const { source, destination, draggableId } = result

    if (source.droppableId !== destination.droppableId) {
      try {
        await updateDoc(doc(db, "tasks", draggableId), {
          status: destination.droppableId,
          updatedAt: new Date()
        })

        toast.success("Task status updated")
      } catch (error) {
        toast.error("Failed to update task status")
      }
    }
  }

  const createTask = async (data: Partial<Task>) => {
    try {
      setIsLoading(true)
      await addDoc(collection(db, "tasks"), {
        ...data,
        assignedTo: user?.uid,
        createdAt: new Date(),
        status: "todo"
      })
      
      toast.success("Task created successfully")
      setIsNewTaskOpen(false)
    } catch (error) {
      toast.error("Failed to create task")
    } finally {
      setIsLoading(false)
    }
  }

  const deleteTask = async (taskId: string) => {
    try {
      await deleteDoc(doc(db, "tasks", taskId))
      toast.success("Task deleted")
    } catch (error) {
      toast.error("Failed to delete task")
    }
  }

  const getTasksByStatus = (status: keyof typeof statusColumns) => {
    return tasks.filter(task => task.status === status)
  }

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500'
      case 'medium':
        return 'bg-yellow-500'
      case 'low':
        return 'bg-green-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <div className="h-[calc(100vh-24px)] pt-32 max-w-[1400px] mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Manage your project tasks
          </p>
        </div>

        <Dialog open={isNewTaskOpen} onOpenChange={setIsNewTaskOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              createTask({
                title: formData.get('title') as string,
                description: formData.get('description') as string,
                priority: formData.get('priority') as Task['priority'],
                projectId: formData.get('projectId') as string,
                dueDate: new Date(formData.get('dueDate') as string),
              })
            }} className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input name="title" required />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea name="description" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select name="priority" defaultValue="medium">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Project</Label>
                  <Select name="projectId" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map(project => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input 
                  type="date" 
                  name="dueDate" 
                  min={format(new Date(), 'yyyy-MM-dd')}
                  required 
                />
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsNewTaskOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  Create Task
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid gap-6 md:grid-cols-3">
          {Object.entries(statusColumns).map(([status, { title, color }]) => (
            <div key={status} className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">{title}</h2>
                <Badge className={color}>{getTasksByStatus(status as keyof typeof statusColumns).length}</Badge>
              </div>

              <Droppable droppableId={status}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="space-y-4"
                  >
                    {getTasksByStatus(status as keyof typeof statusColumns).map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="p-4"
                          >
                            <div className="flex items-start justify-between">
                              <div className="space-y-1">
                                <h3 className="font-medium">{task.title}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {task.description}
                                </p>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => deleteTask(task.id)}>
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>

                            <div className="mt-4 flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-gray-500" />
                                <span>{format(task.dueDate, 'MMM d')}</span>
                              </div>
                              <Badge className={getPriorityColor(task.priority)}>
                                {task.priority}
                              </Badge>
                            </div>
                          </Card>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  )
}