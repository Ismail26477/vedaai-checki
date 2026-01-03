"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, Layout, ExternalLink, Trash2, Calendar, FileText } from "lucide-react"
import { useAuth } from "@/app/contexts/AuthContext"
import { editorSheetsApi } from "@/app/lib/api"
import type { EditorSheet } from "@/types/editorSheet"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { EditorSheetModal } from "./EditorSheetModal"

interface EditorSheetFormData {
  title: string
  description: string
  category: string
  dueDate: string
}

export function EditorSheetManager() {
  const { user } = useAuth()
  const router = useRouter()
  const [sheets, setSheets] = useState<EditorSheet[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("active")
  const [selectedSheetId, setSelectedSheetId] = useState<string | null>(null)
  const [isSheetModalOpen, setIsSheetModalOpen] = useState(false)
  const [formData, setFormData] = useState<EditorSheetFormData>({
    title: "",
    description: "",
    category: "",
    dueDate: "",
  })

  useEffect(() => {
    const fetchSheets = async () => {
      if (!user?.id) return
      setIsLoading(true)
      try {
        const response = await editorSheetsApi.getByEditor(user.id)
        console.log("[v0] Fetch response:", response)
        if (response.success) {
          const sheetsData = response.sheets || []
          console.log("[v0] Sheets fetched:", sheetsData)
          console.log(
            "[v0] Sheets with IDs:",
            sheetsData.filter((s: any) => s.id),
          )
          setSheets(sheetsData)
        } else {
          console.error("[v0] Failed to fetch sheets:", response)
          setSheets([])
        }
      } catch (error) {
        console.error("[v0] Error fetching editor sheets:", error)
        setSheets([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchSheets()
  }, [user?.id])

  const handleCreateSheet = async () => {
    if (!user?.id || !formData.title) return

    try {
      const response = await editorSheetsApi.create({
        ...formData,
        editorId: user.id,
        editorName: user.name,
      })

      console.log("[v0] Create response:", response)
      if (response.success && response.sheet) {
        const newSheet = response.sheet
        console.log("[v0] Successfully created sheet with ID:", newSheet.id)
        setSheets([...sheets, newSheet])
        setFormData({ title: "", description: "", category: "", dueDate: "" })
        setIsDialogOpen(false)
      } else {
        console.error("[v0] Failed to create sheet:", response.error)
      }
    } catch (error) {
      console.error("[v0] Error creating sheet:", error)
    }
  }

  const handleDeleteSheet = async (sheetId: string) => {
    try {
      const response = await editorSheetsApi.delete(sheetId)
      if (response.success) {
        setSheets(sheets.filter((s) => s.id !== sheetId))
      }
    } catch (error) {
      console.error("[v0] Error deleting sheet:", error)
    }
  }

  const handleOpenSheet = (sheetId: string) => {
    if (!sheetId) {
      console.error("[v0] Cannot open sheet: sheetId is undefined")
      return
    }
    console.log("[v0] Opening sheet with ID:", sheetId)
    setSelectedSheetId(sheetId)
    setIsSheetModalOpen(true)
  }

  const activeSheets = sheets.filter((s) => !s.isCompleted)
  const completedSheets = sheets.filter((s) => s.isCompleted)

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold flex items-center gap-3">
              <Layout className="h-8 w-8 text-primary" />
              Editor Sheets Manager
            </h2>
            <p className="text-muted-foreground mt-1">Create and manage content editor sheets</p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Sheet
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Editor Sheet</DialogTitle>
                <DialogDescription>Add a new content sheet for your team to edit</DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Weekly Newsletter"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="Brief description of the sheet"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    placeholder="e.g., Content, Marketing"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateSheet} disabled={!formData.title}>
                  Create Sheet
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="active">Active ({activeSheets.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedSheets.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4 mt-6">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading sheets...</div>
            ) : activeSheets.length > 0 ? (
              <div className="grid gap-4">
                {activeSheets.map((sheet) => {
                  if (!sheet.id) {
                    console.warn("[v0] Sheet without ID found:", sheet)
                    return null
                  }
                  return (
                    <Card key={sheet.id} className="border-border/50 hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              <FileText className="h-5 w-5 text-primary" />
                              {sheet.sheetName || sheet.title}
                            </CardTitle>
                            <CardDescription className="mt-1">{sheet.description}</CardDescription>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteSheet(sheet.id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Category: {sheet.category}</span>
                          {sheet.dueDate && (
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              {new Date(sheet.dueDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        <Button className="w-full gap-2" size="sm" onClick={() => handleOpenSheet(sheet.id)}>
                          <ExternalLink className="h-4 w-4" />
                          Open Sheet
                        </Button>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Layout className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No active sheets. Create one to get started!</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4 mt-6">
            {completedSheets.length > 0 ? (
              <div className="grid gap-4">
                {completedSheets.map((sheet) => {
                  if (!sheet.id) return null
                  return (
                    <Card key={sheet.id} className="border-border/50 opacity-75">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="flex items-center gap-2 line-through">
                              <FileText className="h-5 w-5 text-muted-foreground" />
                              {sheet.sheetName || sheet.title}
                            </CardTitle>
                            <CardDescription className="mt-1">{sheet.description}</CardDescription>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteSheet(sheet.id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Layout className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No completed sheets yet</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <EditorSheetModal
        sheetId={selectedSheetId}
        isOpen={isSheetModalOpen}
        onClose={() => {
          setIsSheetModalOpen(false)
          setSelectedSheetId(null)
        }}
      />
    </>
  )
}
