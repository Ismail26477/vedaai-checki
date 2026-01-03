"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Plus, ArrowLeft, Trash2, Calendar, Link2, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface Task {
  _id: string
  date: string
  title: string
  link: string
}

interface Sheet {
  _id: string
  sheetName: string
  description: string
  category: string
  dueDate: string
  tasks: Task[]
}

interface TaskFormData {
  date: string
  title: string
  link: string
}

export default function EditorSheetDetailPage() {
  const params = useParams()
  const router = useRouter()
  const sheetId = params.sheetId as string

  const [sheet, setSheet] = useState<Sheet | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState<TaskFormData>({
    date: "",
    title: "",
    link: "",
  })

  // Fetch sheet details
  useEffect(() => {
    const fetchSheet = async () => {
      try {
        const response = await fetch(`/api/editor-sheets/${sheetId}`)
        const data = await response.json()
        if (data.success) {
          setSheet(data.sheet)
        } else {
          console.error("[v0] Failed to fetch sheet:", data.error)
        }
      } catch (error) {
        console.error("[v0] Error fetching sheet:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (sheetId) {
      fetchSheet()
    }
  }, [sheetId])

  const handleAddTask = async () => {
    if (!formData.title || !formData.date || !formData.link) return

    try {
      const response = await fetch(`/api/editor-sheets/${sheetId}/add-task`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      if (data.success && sheet) {
        setSheet({
          ...sheet,
          tasks: [...sheet.tasks, data.task],
        })
        setFormData({ date: "", title: "", link: "" })
        setIsDialogOpen(false)
      }
    } catch (error) {
      console.error("[v0] Error adding task:", error)
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/editor-sheets/${sheetId}/delete-task?taskId=${taskId}`, {
        method: "DELETE",
      })

      const data = await response.json()
      if (data.success && sheet) {
        setSheet({
          ...sheet,
          tasks: sheet.tasks.filter((t) => t._id !== taskId),
        })
      }
    } catch (error) {
      console.error("[v0] Error deleting task:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="text-muted-foreground">Loading sheet...</p>
        </div>
      </div>
    )
  }

  if (!sheet) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-destructive">Sheet not found</p>
          <Button onClick={() => router.back()} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header with back button */}
      <div className="flex items-start justify-between">
        <div>
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-2 -ml-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">{sheet.sheetName}</h1>
          <p className="text-muted-foreground mt-1">{sheet.description}</p>
        </div>
      </div>

      {/* Sheet Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sheet Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Category</p>
              <p className="font-medium">{sheet.category || "Not specified"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Due Date</p>
              <p className="font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {sheet.dueDate ? new Date(sheet.dueDate).toLocaleDateString() : "Not set"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasks Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Tasks ({sheet.tasks.length})</h2>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Task</DialogTitle>
                <DialogDescription>Add a task with date, title, and Google Drive link</DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="task-date">Date</Label>
                  <Input
                    id="task-date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="task-title">Title</Label>
                  <Input
                    id="task-title"
                    placeholder="Task title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="task-link">Google Drive Link</Label>
                  <Input
                    id="task-link"
                    placeholder="https://drive.google.com/..."
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddTask} disabled={!formData.date || !formData.title || !formData.link}>
                  Add Task
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {sheet.tasks.length > 0 ? (
          <div className="grid gap-3">
            {sheet.tasks.map((task) => (
              <Card key={task._id} className="border-l-4 border-l-primary">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <h3 className="font-semibold text-lg">{task.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(task.date).toLocaleDateString()}
                        </span>
                        <a
                          href={task.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-primary hover:underline"
                        >
                          <Link2 className="h-4 w-4" />
                          View in Drive
                        </a>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteTask(task._id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-muted-foreground">No tasks yet. Add your first task to get started!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
