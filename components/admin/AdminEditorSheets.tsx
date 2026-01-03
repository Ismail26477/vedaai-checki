"use client"

import { useState, useEffect } from "react"
import { Layout, Search, Users, ChevronRight, LayoutGrid, List } from "lucide-react"
import { editorSheetsApi } from "@/app/lib/api"
import type { EditorSheet } from "@/types/editorSheet"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { AdminEditorSheetModal } from "./AdminEditorSheetModal"

export function AdminEditorSheets() {
  const [sheets, setSheets] = useState<EditorSheet[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedSheetId, setSelectedSheetId] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [viewMode, setViewMode] = useState<"list" | "grid">("list") // Added view mode toggle for responsive design

  useEffect(() => {
    fetchSheets()
  }, [])

  const fetchSheets = async () => {
    try {
      setIsLoading(true)
      const response = await editorSheetsApi.getAllSheets()
      if (response.success && response.data) {
        setSheets(response.data)
      } else {
        setSheets([])
      }
    } catch (error) {
      console.error("[v0] Error fetching all sheets:", error)
      setSheets([])
    } finally {
      setIsLoading(false)
    }
  }

  const filteredSheets = (sheets || []).filter(
    (sheet) =>
      sheet.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sheet.sheetName.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleSelectSheet = (sheet: EditorSheet) => {
    setSelectedSheetId(sheet._id || sheet.id)
    setModalOpen(true)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <AdminEditorSheetModal sheetId={selectedSheetId} isOpen={modalOpen} onClose={() => setModalOpen(false)} />

      {/* Mobile: Single column, Desktop: 3-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Sheets List Section - Mobile optimized */}
        <Card className="lg:col-span-1 h-fit">
          <CardHeader className="pb-3 md:pb-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                  <Users className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
                  <span className="truncate">Editor Sheets</span>
                </CardTitle>
                <CardDescription className="text-xs md:text-sm mt-1">Browse all editor task sheets</CardDescription>
              </div>
              <div className="hidden sm:flex gap-1">
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="h-8 w-8 p-0"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="h-8 w-8 p-0"
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="relative mt-3">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search sheets..."
                className="pl-8 h-9 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {filteredSheets.length === 0 ? (
              <div className="p-6 md:p-8 text-center text-muted-foreground text-sm">No sheets found</div>
            ) : viewMode === "list" ? (
              <ScrollArea className="h-[400px] md:h-[500px]">
                <div className="divide-y">
                  {filteredSheets.map((sheet) => (
                    <button
                      key={sheet._id}
                      onClick={() => handleSelectSheet(sheet)}
                      className="w-full text-left p-3 md:p-4 hover:bg-muted/50 transition-colors flex items-center justify-between group active:bg-muted/70"
                    >
                      <div className="space-y-1 flex-1 min-w-0">
                        <p className="font-medium text-sm md:text-base leading-tight truncate">{sheet.sheetName}</p>
                        <p className="text-xs md:text-sm text-muted-foreground truncate">{sheet.employeeName}</p>
                        <Badge variant="secondary" className="text-[10px] h-5 w-fit">
                          {sheet.tasks?.length || 0} {sheet.tasks?.length === 1 ? "task" : "tasks"}
                        </Badge>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform flex-shrink-0 ml-2" />
                    </button>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filteredSheets.map((sheet) => (
                    <button
                      key={sheet._id}
                      onClick={() => handleSelectSheet(sheet)}
                      className="p-3 border border-border rounded-lg hover:border-primary/50 hover:bg-muted/30 transition-all group text-left"
                    >
                      <h4 className="font-medium text-sm truncate group-hover:text-primary">{sheet.sheetName}</h4>
                      <p className="text-xs text-muted-foreground truncate mt-1">{sheet.employeeName}</p>
                      <Badge variant="secondary" className="text-[10px] h-4 mt-2 w-fit">
                        {sheet.tasks?.length || 0} tasks
                      </Badge>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Details Section - Hidden on mobile, shown on tablet+ */}
        <Card className="hidden lg:flex lg:col-span-2">
          <CardContent className="flex flex-col items-center justify-center h-[600px] text-center w-full">
            <div className="bg-muted p-4 rounded-full mb-4">
              <Layout className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">View Sheet Details</h3>
            <p className="text-muted-foreground text-sm max-w-xs">
              Click on a sheet from the list to open it and view all tasks, dates, and linked resources.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
