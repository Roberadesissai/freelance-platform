// app/dashboard/analytics/page.tsx
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts"
import { 
  ArrowUp, 
  ArrowDown, 
  Loader2,
  Calendar as CalendarIcon,
  Download,
  FileText,
  Filter,
  MoreVertical,
  Plus,
  Target,
  Clock,
  Users,
  TrendingUp,
  BarChart2,
  Settings,
  CheckCircle,
  XCircle
} from "lucide-react"
import { format, subDays, isSameDay } from "date-fns"
import { DateRange } from "react-day-picker"
import { useAuth } from "@/hooks/useAuth"
import { db } from "@/lib/firebase"
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit 
} from "firebase/firestore"
import { toast } from "sonner"

// Constants
const COLORS = {
  blue: '#2563eb',
  green: '#16a34a',
  yellow: '#ca8a04',
  red: '#dc2626',
  purple: '#9333ea',
  orange: '#ea580c',
}

const PROJECT_TYPES = [
  { type: 'Website', color: COLORS.blue },
  { type: 'E-commerce', color: COLORS.green },
  { type: 'Mobile App', color: COLORS.purple },
  { type: 'Web App', color: COLORS.orange },
  { type: 'API', color: COLORS.yellow },
]

const TASK_STATUSES = [
  { status: 'Completed', color: COLORS.green },
  { status: 'In Progress', color: COLORS.blue },
  { status: 'Pending', color: COLORS.yellow },
  { status: 'On Hold', color: COLORS.orange },
]

// Types
interface AnalyticsData {
  projectMetrics: {
    total: number
    completed: number
    inProgress: number
    onHold: number
    completionRate: number
    averageDuration: number
    totalRevenue: number
    projectedRevenue: number
  }
  timelineData: Array<{
    date: string
    projects: number
    tasks: number
    completedTasks: number
    revenue: number
  }>
  projectTypes: Array<{
    type: string
    count: number
    color: string
    revenue: number
  }>
  taskDistribution: Array<{
    status: string
    count: number
    percentage: number
    color: string
  }>
}

interface Task {
  id: string
  status: string
  createdAt: any
  completedAt?: any
  userId: string
}

interface Project {
  id: string
  status: string
  type: string
  budget?: number
  createdAt: any
  completedAt?: any
  userId: string
}

export default function AnalyticsPage() {
  // State
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  })
  const [chartType, setChartType] = useState<'line' | 'bar'>('line')
  const { user } = useAuth()

  // Fetch data on mount and when date range changes
  useEffect(() => {
    if (!user || !dateRange?.from || !dateRange?.to) return
    fetchAnalyticsData()
  }, [user, dateRange])

  const fetchAnalyticsData = async () => {
    if (!user || !dateRange?.from || !dateRange?.to) return

    setIsLoading(true)
    try {
      // Fetch projects
      const projectsRef = collection(db, "projects")
      const projectsQuery = query(
        projectsRef,
        where("userId", "==", user.uid),
        where("createdAt", ">=", dateRange.from),
        where("createdAt", "<=", dateRange.to),
        orderBy("createdAt", "asc")
      )
      const projectsSnapshot = await getDocs(projectsQuery)
      const projects = projectsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Project))

      // Fetch tasks
      const tasksRef = collection(db, "tasks")
      const tasksQuery = query(
        tasksRef,
        where("userId", "==", user.uid),
        where("createdAt", ">=", dateRange.from),
        where("createdAt", "<=", dateRange.to)
      )
      const tasksSnapshot = await getDocs(tasksQuery)
      const tasks = tasksSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Task))

      // Process data
      const completedProjects = projects.filter(p => p.status === 'completed')
      const completionRate = projects.length ? (completedProjects.length / projects.length) * 100 : 0

      // Calculate metrics
      const metrics = {
        total: projects.length,
        completed: completedProjects.length,
        inProgress: projects.filter(p => p.status === 'in_progress').length,
        onHold: projects.filter(p => p.status === 'on_hold').length,
        completionRate,
        averageDuration: calculateAverageDuration(completedProjects),
        totalRevenue: calculateTotalRevenue(completedProjects),
        projectedRevenue: calculateProjectedRevenue(projects)
      }

      // Timeline data
      const timeline = processTimelineData(projects, tasks, dateRange)

      // Project types distribution
      const typeDistribution = PROJECT_TYPES.map(type => ({
        ...type,
        count: projects.filter(p => p.type === type.type).length,
        revenue: calculateRevenueByType(projects, type.type)
      }))

      // Task distribution
      const taskDist = TASK_STATUSES.map(status => {
        const statusTasks = tasks.filter(t => t.status.toLowerCase() === status.status.toLowerCase())
        return {
          ...status,
          count: statusTasks.length,
          percentage: tasks.length ? (statusTasks.length / tasks.length) * 100 : 0
        }
      })

      setData({
        projectMetrics: metrics,
        timelineData: timeline,
        projectTypes: typeDistribution,
        taskDistribution: taskDist
      })
    } catch (error) {
      console.error("Error fetching analytics data:", error)
      toast.error("Failed to fetch analytics data")
    } finally {
      setIsLoading(false)
    }
  }

  // Helper functions
  const calculateAverageDuration = (projects: any[]) => {
    if (!projects.length) return 0
    return projects.reduce((acc, project) => {
      const start = new Date(project.createdAt.toDate())
      const end = new Date(project.completedAt.toDate())
      return acc + (end.getTime() - start.getTime())
    }, 0) / (projects.length * 1000 * 60 * 60 * 24)
  }

  const calculateTotalRevenue = (projects: any[]) => {
    return projects.reduce((acc, project) => acc + (project.budget || 0), 0)
  }

  const calculateProjectedRevenue = (projects: any[]) => {
    return projects.reduce((acc, project) => {
      if (project.status !== 'completed') {
        return acc + (project.budget || 0)
      }
      return acc
    }, 0)
  }

  const calculateRevenueByType = (projects: any[], type: string) => {
    return projects
      .filter(p => p.type === type)
      .reduce((acc, project) => acc + (project.budget || 0), 0)
  }

  const processTimelineData = (projects: any[], tasks: any[], dateRange: DateRange) => {
    const timeline = []
    let currentDate = new Date(dateRange.from!)
    const endDate = new Date(dateRange.to!)

    while (currentDate <= endDate) {
      const dateStr = format(currentDate, 'MMM dd')
      
      const dayProjects = projects.filter(p => 
        isSameDay(new Date(p.createdAt.toDate()), currentDate)
      )
      
      const dayTasks = tasks.filter(t => 
        isSameDay(new Date(t.createdAt.toDate()), currentDate)
      )
      
      const completedTasks = tasks.filter(t => 
        t.status === 'completed' && 
        isSameDay(new Date(t.completedAt.toDate()), currentDate)
      )

      timeline.push({
        date: dateStr,
        projects: dayProjects.length,
        tasks: dayTasks.length,
        completedTasks: completedTasks.length,
        revenue: dayProjects.reduce((acc, p) => acc + (p.budget || 0), 0)
      })

      currentDate.setDate(currentDate.getDate() + 1)
    }

    return timeline
  }

  if (isLoading || !data) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    )
  }

  return (
    <div className="container space-y-8 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Track your project metrics and performance insights
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Date Range Selector */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} -{" "}
                      {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>

          {/* Chart Type Selector */}
          <Select
            value={chartType}
            onValueChange={(value: 'line' | 'bar') => setChartType(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select chart type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="line">Line Chart</SelectItem>
              <SelectItem value="bar">Bar Chart</SelectItem>
            </SelectContent>
          </Select>

          {/* Export Button */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Export as PDF</DropdownMenuItem>
              <DropdownMenuItem>Export as Excel</DropdownMenuItem>
              <DropdownMenuItem>Export as CSV</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Projects"
          value={data.projectMetrics.total}
          change={12}
          icon={Target}
          trend="up"
        />
        <MetricCard
          title="Completion Rate"
          value={`${data.projectMetrics.completionRate.toFixed(1)}%`}
          change={5.2}
          icon={TrendingUp}
          trend="up"
        />
        <MetricCard
          title="Active Projects"
          value={data.projectMetrics.inProgress}
          change={-2}
          icon={BarChart2}
          trend="down"
        />
        <MetricCard
          title="Average Duration"
          value={`${Math.round(data.projectMetrics.averageDuration)} days`}
          change={-1.5}
          icon={Clock}
          trend="down"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Timeline Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Project Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'line' ? (
                  <LineChart data={data.timelineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="projects" 
                      stroke={COLORS.blue} 
                      strokeWidth={2}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="completedTasks" 
                      stroke={COLORS.green} 
                      strokeWidth={2}
                    />
                  </LineChart>
                ) : (
                  <BarChart data={data.timelineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="projects" fill={COLORS.blue} />
                    <Bar dataKey="completedTasks" fill={COLORS.green} />
                    </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Project Types Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Project Types Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.projectTypes}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {data.projectTypes.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color}
                      strokeWidth={0}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`${value} projects`]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Task Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Task Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.taskDistribution.map((task) => (
              <div key={task.status} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{task.status}</span>
                  <span>{task.count} tasks ({task.percentage.toFixed(1)}%)</span>
                </div>
                <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${task.percentage}%`,
                      backgroundColor: task.color
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>

    {/* Export Modal - Add if needed */}
    {/* Additional Metrics Section - Add if needed */}
    {/* Activity Feed - Add if needed */}
  </div>
)}

// MetricCard Component
const MetricCard = ({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  trend 
}: { 
  title: string
  value: string | number
  change: number
  icon: any
  trend: 'up' | 'down'
}) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
          <div className={`rounded-full p-3 ${
            trend === 'up' 
              ? 'bg-green-100 dark:bg-green-900' 
              : 'bg-red-100 dark:bg-red-900'
          }`}>
            <Icon className={`h-6 w-6 ${
              trend === 'up'
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            }`} />
          </div>
        </div>
        <div className={`mt-4 flex items-center text-sm ${
          trend === 'up'
            ? 'text-green-600 dark:text-green-400'
            : 'text-red-600 dark:text-red-400'
        }`}>
          {trend === 'up' ? (
            <ArrowUp className="mr-1 h-4 w-4" />
          ) : (
            <ArrowDown className="mr-1 h-4 w-4" />
          )}
          <span>{Math.abs(change)}% from last period</span>
        </div>
      </CardContent>
    </Card>
  )
}