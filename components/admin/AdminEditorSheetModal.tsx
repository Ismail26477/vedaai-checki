"use client"

import { useState, useEffect } from "react"
import { Plus, Calendar, Link2, Trash2, FileText, Clock, Pencil, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent } from "@/components/ui/dialog"

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
  employeeName: string
}

interface TaskFormData {
  date: string
  title: string
  link: string
}

interface AdminEditorSheetModalProps {
  sheetId: string | null
  isOpen: boolean
  onClose: () => void
}

export function AdminEditorSheetModal({ sheetId, isOpen, onClose }: AdminEditorSheetModalProps) {
  const [sheet, setSheet] = useState<Sheet | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isAddingTask, setIsAddingTask] = useState(false)
  const [isEditingSheet, setIsEditingSheet] = useState(false)
  const [editedSheet, setEditedSheet] = useState<Partial<Sheet> | null>(null)
  const [isSavingSheet, setIsSavingSheet] = useState(false)
  const [formData, setFormData] = useState<TaskFormData>({
    date: "",
    title: "",
    link: "",
  })

  useEffect(() => {
    if (!sheetId || !isOpen) return

    const fetchSheet = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/editor-sheets/${sheetId}`)
        const data = await response.json()
        if (data.success) {
          setSheet(data.sheet)
        }
      } catch (error) {
        console.error("[v0] Error fetching sheet:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSheet()
  }, [sheetId, isOpen])

  const handleEditSheet = () => {
    if (sheet) {
      setEditedSheet({
        sheetName: sheet.sheetName,
        description: sheet.description,
        category: sheet.category,
        dueDate: sheet.dueDate,
      })
      setIsEditingSheet(true)
    }
  }

  const handleSaveSheet = async () => {
    if (!editedSheet || !sheetId || !sheet) return

    setIsSavingSheet(true)
    try {
      const response = await fetch(`/api/editor-sheets/${sheetId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sheetName: editedSheet.sheetName,
          description: editedSheet.description,
          category: editedSheet.category,
          dueDate: editedSheet.dueDate,
        }),
      })

      const data = await response.json()
      if (data.success) {
        setSheet({
          ...sheet,
          sheetName: editedSheet.sheetName || sheet.sheetName,
          description: editedSheet.description || sheet.description,
          category: editedSheet.category || sheet.category,
          dueDate: editedSheet.dueDate || sheet.dueDate,
        })
        setIsEditingSheet(false)
        setEditedSheet(null)
      }
    } catch (error) {
      console.error("[v0] Error saving sheet:", error)
    } finally {
      setIsSavingSheet(false)
    }
  }

  const handleCancelEdit = () => {
    setIsEditingSheet(false)
    setEditedSheet(null)
  }

  const handleAddTask = async () => {
    if (!formData.title || !formData.date || !formData.link || !sheetId) return

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
        setIsAddingTask(false)
      }
    } catch (error) {
      console.error("[v0] Error adding task:", error)
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!sheetId || !sheet) return

    try {
      const response = await fetch(`/api/editor-sheets/${sheetId}/delete-task?taskId=${taskId}`, {
        method: "DELETE",
      })

      const data = await response.json()
      if (data.success) {
        setSheet({
          ...sheet,
          tasks: sheet.tasks.filter((t) => t._id !== taskId),
        })
      }
    } catch (error) {
      console.error("[v0] Error deleting task:", error)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {isLoading ? (
          <div className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground">Loading sheet...</p>
          </div>
        ) : !sheet ? (
          <div className="py-12 text-center">
            <p className="text-destructive">Sheet not found</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-2 border-b pb-6">
              {isEditingSheet ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="sheet-name" className="text-xs font-medium">
                      Sheet Name
                    </Label>
                    <Input
                      id="sheet-name"
                      value={editedSheet?.sheetName || ""}
                      onChange={(e) => setEditedSheet({ ...editedSheet, sheetName: e.target.value })}
                      className="text-lg font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sheet-desc" className="text-xs font-medium">
                      Description
                    </Label>
                    <Input
                      id="sheet-desc"
                      value={editedSheet?.description || ""}
                      onChange={(e) => setEditedSheet({ ...editedSheet, description: e.target.value })}
                      placeholder="Sheet description"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="sheet-category" className="text-xs font-medium">
                        Category
                      </Label>
                      <Input
                        id="sheet-category"
                        value={editedSheet?.category || ""}
                        onChange={(e) => setEditedSheet({ ...editedSheet, category: e.target.value })}
                        placeholder="e.g., Content, Design"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sheet-duedate" className="text-xs font-medium">
                        Due Date
                      </Label>
                      <Input
                        id="sheet-duedate"
                        type="date"
                        value={editedSheet?.dueDate ? editedSheet.dueDate.split("T")[0] : ""}
                        onChange={(e) => setEditedSheet({ ...editedSheet, dueDate: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end pt-2">
                    <Button size="sm" variant="outline" onClick={handleCancelEdit} disabled={isSavingSheet}>
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleSaveSheet} disabled={isSavingSheet}>
                      <Check className="h-4 w-4 mr-1" />
                      {isSavingSheet ? "Saving..." : "Save"}
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">{sheet.sheetName}</h2>
                      <p className="text-sm text-muted-foreground">By {sheet.employeeName}</p>
                      <p className="text-muted-foreground">{sheet.description}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleEditSheet}
                      className="text-primary hover:text-primary hover:bg-primary/10"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              )}
            </div>

            {!isEditingSheet && (
              <>
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg border border-border">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Category</p>
                    <p className="text-sm font-semibold text-foreground">{sheet.category || "Not specified"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Due Date</p>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <p className="text-sm font-semibold text-foreground">
                        {sheet.dueDate ? new Date(sheet.dueDate).toLocaleDateString() : "Not set"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-semibold">Tasks ({sheet.tasks.length})</h3>
                    </div>
                    {!isAddingTask && (
                      <Button size="sm" className="gap-2" onClick={() => setIsAddingTask(true)}>
                        <Plus className="h-4 w-4" />
                        Add Task
                      </Button>
                    )}
                  </div>

                  {isAddingTask && (
                    <div className="p-4 bg-muted/40 border border-border rounded-lg space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="task-date" className="text-xs font-medium">
                            Date
                          </Label>
                          <Input
                            id="task-date"
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            className="h-9"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="task-title" className="text-xs font-medium">
                            Title
                          </Label>
                          <Input
                            id="task-title"
                            placeholder="Task title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="h-9"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="task-link" className="text-xs font-medium">
                          Google Drive Link
                        </Label>
                        <Input
                          id="task-link"
                          placeholder="https://drive.google.com/..."
                          value={formData.link}
                          onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                          className="h-9"
                        />
                      </div>
                      <div className="flex gap-2 justify-end pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setIsAddingTask(false)
                            setFormData({ date: "", title: "", link: "" })
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleAddTask}
                          disabled={!formData.date || !formData.title || !formData.link}
                        >
                          Add Task
                        </Button>
                      </div>
                    </div>
                  )}

                  {sheet.tasks.length > 0 ? (
                    <div className="space-y-2">
                      {sheet.tasks.map((task) => (
                        <div
                          key={task._id}
                          className="p-4 border border-border rounded-lg hover:bg-muted/20 hover:border-primary/30 transition-colors group"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 space-y-2 min-w-0">
                              <h4 className="font-semibold text-foreground line-clamp-2">{task.title}</h4>
                              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                                  {new Date(task.date).toLocaleDateString()}
                                </span>
                                <a
                                  href={task.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-primary hover:underline flex-shrink-0"
                                >
                                  <Link2 className="h-3.5 w-3.5" />
                                  Drive
                                </a>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteTask(task._id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center border border-dashed border-border rounded-lg">
                      <FileText className="h-10 w-10 mx-auto mb-2 opacity-50" />
                      <p className="text-sm text-muted-foreground">No tasks yet. Add your first task to get started!</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
