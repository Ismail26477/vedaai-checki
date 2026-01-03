"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Clock, AlertCircle, FileText } from "lucide-react"
import { format } from "date-fns"

interface TaskCardProps {
  task: any
  onEdit?: (task: any) => void
  onApprove?: (task: any, status: "approved" | "rejected", remarks?: string) => void
  isEditable?: boolean
  isApprovable?: boolean
  showApprovalButtons?: boolean
}

export function TaskCard({ task, onEdit, onApprove, isEditable, showApprovalButtons }: TaskCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
      default:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle2 className="w-4 h-4" />
      case "rejected":
        return <AlertCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const timeDifference = task.remarks.timeTaken - task.remarks.timeExpected
  const isOverTime = timeDifference > 0

  return (
    <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              {task.project}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{format(new Date(task.date), "MMM dd, yyyy")}</p>
          </div>
          <Badge className={`${getStatusColor(task.approvalStatus)} gap-1`}>
            {getStatusIcon(task.approvalStatus)}
            {task.approvalStatus.charAt(0).toUpperCase() + task.approvalStatus.slice(1)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Work Summary */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
            <p className="text-xs text-muted-foreground">Working Hours</p>
            <p className="text-xl font-bold text-blue-600">{task.workingTime}h</p>
          </div>
          <div
            className={`p-3 rounded-lg ${isOverTime ? "bg-orange-50 dark:bg-orange-950" : "bg-green-50 dark:bg-green-950"}`}
          >
            <p className="text-xs text-muted-foreground">Time Variance</p>
            <p className={`text-xl font-bold ${isOverTime ? "text-orange-600" : "text-green-600"}`}>
              {isOverTime ? "+" : ""}
              {timeDifference.toFixed(1)}h
            </p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-950 p-3 rounded-lg">
            <p className="text-xs text-muted-foreground">Expected vs Actual</p>
            <p className="text-sm font-semibold text-purple-600">
              {task.remarks.timeExpected}h / {task.remarks.timeTaken}h
            </p>
          </div>
        </div>

        {/* Task Details */}
        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-1">Work Done</h4>
            <p className="text-sm text-muted-foreground line-clamp-2">{task.taskDone}</p>
          </div>

          {task.researchDone && (
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-1">Research Done</h4>
              <p className="text-sm text-muted-foreground line-clamp-2">{task.researchDone}</p>
            </div>
          )}

          <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
            <h4 className="text-sm font-semibold text-foreground mb-2">Time Analysis</h4>
            <p className="text-xs text-muted-foreground">{task.remarks.reason}</p>
          </div>
        </div>

        {/* Manager Remarks (if approved/rejected) */}
        {task.approvalStatus !== "pending" && (
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-900 p-3 rounded-lg">
            <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">Manager's Feedback</h4>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              {task.managerRemarks || task.managerComplains || "No additional remarks"}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        {(isEditable || showApprovalButtons) && (
          <div className="flex gap-2 pt-2">
            {isEditable && (
              <Button variant="outline" size="sm" onClick={() => onEdit?.(task)} className="flex-1">
                Edit
              </Button>
            )}
            {showApprovalButtons && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 text-green-600 hover:text-green-700 border-green-200 bg-transparent"
                  onClick={() => onApprove?.(task, "approved")}
                >
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 text-red-600 hover:text-red-700 border-red-200 bg-transparent"
                  onClick={() => onApprove?.(task, "rejected")}
                >
                  Reject
                </Button>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
