"use client"

import { useState, useEffect } from "react"
import { Layout, Search, Users, ChevronRight } from "lucide-react"
import { editorSheetsApi } from "@/app/lib/api"
import type { EditorSheet } from "@/types/editorSheet"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AdminEditorSheetModal } from "./AdminEditorSheetModal"

export function AdminEditorSheets() {
  const [sheets, setSheets] = useState<EditorSheet[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedSheet, setSelectedSheet] = useState<EditorSheet | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedSheetId, setSelectedSheetId] = useState<string | null>(null)

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sheets List Section */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Editor Sheets
            </CardTitle>
            <CardDescription>Browse and monitor all editor task sheets</CardDescription>
            <div className="relative mt-2">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search editor or sheet..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              <div className="divide-y">
                {filteredSheets.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">No sheets found</div>
                ) : (
                  filteredSheets.map((sheet) => (
                    <button
                      key={sheet._id}
                      onClick={() => handleSelectSheet(sheet)}
                      className={`w-full text-left p-4 hover:bg-muted/50 transition-colors flex items-center justify-between group`}
                    >
                      <div className="space-y-1">
                        <p className="font-medium leading-none">{sheet.sheetName}</p>
                        <p className="text-sm text-muted-foreground">{sheet.employeeName}</p>
                        <Badge variant="secondary" className="text-[10px] h-4">
                          {sheet.tasks?.length || 0} tasks
                        </Badge>
                      </div>
                      <ChevronRight
                        className={`w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform`}
                      />
                    </button>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardContent className="flex flex-col items-center justify-center h-[600px] text-center">
            <div className="bg-muted p-4 rounded-full mb-4">
              <Layout className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">View Sheet Details</h3>
            <p className="text-muted-foreground max-w-xs">
              Click on a sheet from the list to open it and view all tasks, dates, and linked resources.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
