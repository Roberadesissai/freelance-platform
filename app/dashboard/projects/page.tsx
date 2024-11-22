// app/dashboard/projects/page.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  LayoutGrid,
  List,
  Plus,
  Search,
  Clock,
  Calendar,
  DollarSign,
  Filter,
} from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { db } from "@/lib/firebase"
import { collection, addDoc, query, where, orderBy } from "firebase/firestore"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { format } from "date-fns"

const projectSchema = z.object({
  name: z.string().min(2, "Project name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  type: z.enum(["website", "ecommerce", "mobile", "other"]),
  deadline: z.string(),
  budget: z.number().min(100, "Minimum budget is $100"),
})

type ProjectFormData = z.infer<typeof projectSchema>

export default function ProjectsPage() {
  const [view, setView] = useState<"grid" | "list">("grid")
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false)
  const { user } = useAuth()
  const [projects, setProjects] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      type: "website",
      budget: 500,
    }
  })

  const onSubmit = async (data: ProjectFormData) => {
    try {
      setIsLoading(true)
      const docRef = await addDoc(collection(db, "projects"), {
        ...data,
        userId: user?.uid,
        status: "pending",
        progress: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      toast.success("Project created successfully!")
      setIsNewProjectOpen(false)
      form.reset()
    } catch (error) {
      toast.error("Failed to create project")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="h-[calc(100vh-24px)] pt-32 max-w-[1400px] mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Manage your web development projects
          </p>
        </div>

        <Dialog open={isNewProjectOpen} onOpenChange={setIsNewProjectOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>
                Fill in the project details to get started
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label>Project Name</Label>
                  <Input {...form.register("name")} />
                  {form.formState.errors.name && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label>Description</Label>
                  <Input {...form.register("description")} />
                  {form.formState.errors.description && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.description.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label>Project Type</Label>
                  <Select
                    onValueChange={(value) => form.setValue("type", value as any)}
                    defaultValue={form.getValues("type")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select project type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="website">Website</SelectItem>
                      <SelectItem value="ecommerce">E-commerce</SelectItem>
                      <SelectItem value="mobile">Mobile App</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Deadline</Label>
                  <Input
                    type="date"
                    min={format(new Date(), "yyyy-MM-dd")}
                    {...form.register("deadline")}
                  />
                </div>

                <div>
                  <Label>Budget ($)</Label>
                  <Input
                    type="number"
                    min="100"
                    step="100"
                    {...form.register("budget", { valueAsNumber: true })}
                  />
                  {form.formState.errors.budget && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.budget.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsNewProjectOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  Create Project
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters and Search */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <Input
            placeholder="Search projects..."
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setView("grid")}
            className={view === "grid" ? "bg-primary text-white" : ""}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setView("list")}
            className={view === "list" ? "bg-primary text-white" : ""}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Projects Grid/List */}
      <div className={view === "grid" ? "grid gap-6 md:grid-cols-2 lg:grid-cols-3" : "space-y-4"}>
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} view={view} />
        ))}
      </div>
    </div>
  )
}

function ProjectCard({ project, view }: { project: any, view: "grid" | "list" }) {
  return (
    <Card className="relative overflow-hidden">
      <CardHeader>
        <CardTitle>{project.name}</CardTitle>
        <CardDescription>{project.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge
              className={
                project.status === "completed"
                  ? "bg-green-500"
                  : project.status === "in_progress"
                  ? "bg-blue-500"
                  : "bg-orange-500"
              }
            >
              {project.status}
            </Badge>
            <span className="text-sm text-gray-500">
              {project.progress}% Complete
            </span>
          </div>
          <Progress value={project.progress} />
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span>{format(new Date(project.deadline), "MMM d, yyyy")}</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-gray-500" />
              <span>${project.budget.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}