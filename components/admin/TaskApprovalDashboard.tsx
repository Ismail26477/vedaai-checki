"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle2, User } from "lucide-react"
import { format } from "date-fns"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export function TaskApprovalDashboard() {
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState("pending")
  const [selectedTask, setSelectedTask] = useState<any>(null)
  const [approvalRemarks, setApprovalRemarks] = useState("")
  const [rejectionReason, setRejectionReason] = useState("")
  const { toast } = useToast()

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const endpoint = activeFilter === "all" ? "/api/tasks/all" : "/api/tasks/pending"
      const response = await fetch(endpoint)
      if (!response.ok) throw new Error("Failed to fetch tasks")
      const data = await response.json()
      setTasks(data?.data ? data.data : Array.isArray(data) ? data : [])
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [activeFilter])

  const handleApprove = async (task: any) => {
    try {
      const response = await fetch("/api/tasks/approve", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: task._id,
          approvalStatus: "approved",
          approverId: "507f1f77bcf86cd799439011",
          remarks: approvalRemarks,
          complains: "",
        }),
      })

      if (!response.ok) throw new Error("Failed to approve task")

      toast({
        title: "Success",
        description: "Task approved successfully",
      })
      setApprovalRemarks("")
      setSelectedTask(null)
      fetchTasks()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleReject = async (task: any) => {
    try {
      const response = await fetch("/api/tasks/approve", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: task._id,
          approvalStatus: "rejected",
          approverId: "507f1f77bcf86cd799439011",
          remarks: "",
          complains: rejectionReason,
        }),
      })

      if (!response.ok) throw new Error("Failed to reject task")

      toast({
        title: "Success",
        description: "Task rejected successfully",
      })
      setRejectionReason("")
      setSelectedTask(null)
      fetchTasks()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Loading tasks...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b">
        <div>
          <h3 className="text-3xl font-extrabold tracking-tight mb-2">Intelligence Oversight</h3>
          <p className="text-muted-foreground font-medium">Monitor and validate workforce performance metrics.</p>
        </div>
        <Tabs value={activeFilter} onValueChange={setActiveFilter} className="w-auto">
          <TabsList className="bg-muted p-1 rounded-xl">
            <TabsTrigger value="pending" className="px-6 py-2 rounded-lg">
              Pending Review
            </TabsTrigger>
            <TabsTrigger value="all" className="px-6 py-2 rounded-lg">
              All Activity
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <Card className="border-none shadow-2xl overflow-hidden bg-background/50 backdrop-blur-md">
        <CardContent className="p-0">
          {tasks.length === 0 ? (
            <div className="py-24 text-center">
              <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4 opacity-20" />
              <h3 className="text-xl font-bold mb-1">Clean Slate</h3>
              <p className="text-muted-foreground">No pending tasks require your oversight at this moment.</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="py-5 font-black text-[10px] uppercase tracking-widest pl-8">Employee</TableHead>
                  <TableHead className="py-5 font-black text-[10px] uppercase tracking-widest">Project</TableHead>
                  <TableHead className="py-5 font-black text-[10px] uppercase tracking-widest">Date</TableHead>
                  <TableHead className="py-5 font-black text-[10px] uppercase tracking-widest text-center">
                    Hours
                  </TableHead>
                  <TableHead className="py-5 font-black text-[10px] uppercase tracking-widest">Status</TableHead>
                  <TableHead className="py-5 font-black text-[10px] uppercase tracking-widest pr-8 text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task) => (
                  <TableRow key={task._id} className="group hover:bg-muted/30 transition-all border-b border-muted/50">
                    <TableCell className="py-4 pl-8">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                          <User className="h-4 w-4 text-blue-500" />
                        </div>
                        <span className="font-bold text-sm tracking-tight">{task.employeeId?.name || "Member"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 font-semibold text-sm">{task.project}</TableCell>
                    <TableCell className="py-4 text-xs text-muted-foreground font-medium">
                      {format(new Date(task.date), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell className="py-4 text-center">
                      <span className="inline-flex items-center justify-center h-8 w-12 rounded-lg bg-slate-100 dark:bg-slate-800 font-black text-sm">
                        {task.workingTime}h
                      </span>
                    </TableCell>
                    <TableCell className="py-4">
                      <Badge
                        variant="outline"
                        className={`uppercase text-[9px] font-black tracking-widest px-2 py-0.5 rounded ${
                          task.approvalStatus === "approved"
                            ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-500"
                            : task.approvalStatus === "rejected"
                              ? "border-rose-500/30 bg-rose-500/5 text-rose-500"
                              : "border-amber-500/30 bg-amber-500/5 text-amber-500"
                        }`}
                      >
                        {task.approvalStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4 pr-8 text-right">
                      <div className="flex justify-end gap-2">
                        {task.approvalStatus === "pending" ? (
                          <div className="flex gap-1.5">
                            <Button
                              size="sm"
                              className="bg-emerald-600 hover:bg-emerald-700 h-8 px-3 rounded-lg text-[10px] font-black uppercase tracking-wider"
                              onClick={() => handleApprove(task)}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="h-8 px-3 rounded-lg text-[10px] font-black uppercase tracking-wider"
                              onClick={() => handleReject(task)}
                            >
                              Reject
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-xs font-bold text-muted-foreground"
                          >
                            Details
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
