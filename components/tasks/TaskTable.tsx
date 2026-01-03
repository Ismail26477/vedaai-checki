"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { CheckCircle2, XCircle, Clock, ExternalLink } from "lucide-react"

interface TaskTableProps {
  tasks: any[]
  showApprovalButtons?: boolean
  onApprove?: (task: any, status: "approved" | "rejected") => void
}

export function TaskTable({ tasks, showApprovalButtons, onApprove }: TaskTableProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 gap-1.5 px-3 py-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Approved
          </Badge>
        )
      case "rejected":
        return (
          <Badge className="bg-rose-500/10 text-rose-500 border-rose-500/20 gap-1.5 px-3 py-1">
            <XCircle className="w-3.5 h-3.5" /> Rejected
          </Badge>
        )
      default:
        return (
          <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 gap-1.5 px-3 py-1">
            <Clock className="w-3.5 h-3.5" /> Pending
          </Badge>
        )
    }
  }

  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="font-bold">Project</TableHead>
            <TableHead className="font-bold">Date</TableHead>
            <TableHead className="font-bold text-center">Hours</TableHead>
            <TableHead className="font-bold">Work Done</TableHead>
            <TableHead className="font-bold">Status</TableHead>
            <TableHead className="font-bold text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TableRow key={task._id} className="group hover:bg-muted/30 transition-colors">
              <TableCell className="font-semibold text-foreground">{task.project}</TableCell>
              <TableCell className="text-muted-foreground whitespace-nowrap">
                {format(new Date(task.date), "MMM dd, yyyy")}
              </TableCell>
              <TableCell className="text-center font-bold text-blue-500">{task.workingTime}h</TableCell>
              <TableCell className="max-w-md">
                <p className="text-sm text-muted-foreground line-clamp-1 group-hover:line-clamp-none transition-all duration-300">
                  {task.taskDone}
                </p>
              </TableCell>
              <TableCell>{getStatusBadge(task.approvalStatus)}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  {showApprovalButtons ? (
                    <>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10"
                        onClick={() => onApprove?.(task, "approved")}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                        onClick={() => onApprove?.(task, "rejected")}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <Button size="sm" variant="ghost" className="h-8 px-2 text-muted-foreground">
                      <ExternalLink className="h-3.5 w-3.5 mr-1" /> View
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
