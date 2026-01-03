"use client"

import { useState, useEffect } from "react"
import { TaskCard } from "./TaskCard"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Search, Filter, List, TableIcon } from "lucide-react"
import { TaskTable } from "./TaskTable"
import { Button } from "@/components/ui/button"

interface TaskListProps {
  employeeId?: string
  isAdmin?: boolean
  isManager?: boolean
}

export function TaskList({ employeeId, isAdmin, isManager }: TaskListProps) {
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTab, setSelectedTab] = useState("all")
  const [viewMode, setViewMode] = useState<"card" | "table">("table")
  const { toast } = useToast()

  const fetchTasks = async () => {
    if (!employeeId || employeeId === "undefined") {
      setTasks([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const url = isManager ? "/api/tasks/pending" : `/api/tasks/employee/${employeeId}`
      const response = await fetch(url)
      if (!response.ok) throw new Error("Failed to fetch tasks")
      const data = await response.json()
      setTasks(data?.data ? data.data : Array.isArray(data) ? data : [])
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
      console.log("[v0] TaskList fetch error:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [employeeId, isManager])

  const handleApprove = async (task: any, status: "approved" | "rejected") => {
    try {
      const response = await fetch("/api/tasks/approve", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: task._id,
          approvalStatus: status,
          approverId: "current-user-id",
          remarks: "",
          complains: "",
        }),
      })

      if (!response.ok) throw new Error("Failed to update task")

      toast({
        title: "Success",
        description: `Task ${status} successfully`,
      })
      fetchTasks()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const filteredTasks = tasks.filter(
    (task) =>
      task.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.taskDone.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const tabTasks = {
    all: filteredTasks,
    pending: filteredTasks.filter((t) => t.approvalStatus === "pending"),
    approved: filteredTasks.filter((t) => t.approvalStatus === "approved"),
    rejected: filteredTasks.filter((t) => t.approvalStatus === "rejected"),
  }

  return (
    <Card className="border-none shadow-xl bg-background/50 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 border-b">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Filter className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold">
                {isManager ? "Intelligence Oversight" : "Your Daily Tasks"}
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Manage and track work performance</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-muted/50 p-1 rounded-lg border">
              <Button
                variant={viewMode === "table" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("table")}
                className="h-8 w-8 p-0"
              >
                <TableIcon className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "card" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("card")}
                className="h-8 w-8 p-0"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading tasks...</p>
          </div>
        ) : (
          <>
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All ({tabTasks.all.length})</TabsTrigger>
                <TabsTrigger value="pending">Pending ({tabTasks.pending.length})</TabsTrigger>
                <TabsTrigger value="approved">Approved ({tabTasks.approved.length})</TabsTrigger>
                <TabsTrigger value="rejected">Rejected ({tabTasks.rejected.length})</TabsTrigger>
              </TabsList>

              {["all", "pending", "approved", "rejected"].map((tab) => (
                <TabsContent key={tab} value={tab} className="mt-0">
                  {tabTasks[tab as keyof typeof tabTasks].length === 0 ? (
                    <div className="text-center py-20 bg-muted/20 rounded-xl border-2 border-dashed">
                      <p className="text-muted-foreground font-medium">No tasks found in this category</p>
                    </div>
                  ) : (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                      {viewMode === "table" ? (
                        <TaskTable
                          tasks={tabTasks[tab as keyof typeof tabTasks]}
                          showApprovalButtons={isManager && tab === "pending"}
                          onApprove={handleApprove}
                        />
                      ) : (
                        <div className="grid grid-cols-1 gap-4">
                          {tabTasks[tab as keyof typeof tabTasks].map((task) => (
                            <TaskCard
                              key={task._id}
                              task={task}
                              showApprovalButtons={isManager && task.approvalStatus === "pending"}
                              onApprove={handleApprove}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </>
        )}
      </CardContent>
    </Card>
  )
}
