"use client"

import type React from "react"

import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, Clock } from "lucide-react"

interface DailyTaskFormProps {
  employeeId: string
  onSuccess?: () => void
  initialData?: any
}

export function DailyTaskForm({ employeeId, onSuccess, initialData }: DailyTaskFormProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState(
    initialData || {
      date: new Date().toISOString().split("T")[0],
      project: "",
      workingTime: 8,
      taskDone: "",
      researchDone: "",
      remarks: {
        timeTaken: 0,
        timeExpected: 0,
        reason: "",
      },
    },
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = initialData?.id ? "/api/tasks/update" : "/api/tasks/create"
      const payload = initialData?.id ? { taskId: initialData.id, ...formData } : { employeeId, ...formData }

      const response = await fetch(url, {
        method: initialData?.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) throw new Error("Failed to save task")

      toast({
        title: "Success",
        description: initialData?.id ? "Task updated successfully" : "Task created successfully",
      })
      onSuccess?.()
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

  return (
    <Card className="border-blue-200 dark:border-blue-900">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600" />
          Daily Work Report
        </CardTitle>
        <CardDescription>Document your daily tasks, work done, and time spent</CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date & Project Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="text-sm font-medium">
                Date
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
                className="border-gray-200"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project" className="text-sm font-medium">
                Project Name
              </Label>
              <Input
                id="project"
                placeholder="e.g., Client Website Redesign"
                value={formData.project}
                onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                required
                className="border-gray-200"
              />
            </div>
          </div>

          {/* Working Time */}
          <div className="space-y-2">
            <Label htmlFor="workingTime" className="text-sm font-medium">
              Total Working Hours
            </Label>
            <Input
              id="workingTime"
              type="number"
              min="0"
              max="24"
              step="0.5"
              value={formData.workingTime}
              onChange={(e) => setFormData({ ...formData, workingTime: Number.parseFloat(e.target.value) })}
              className="border-gray-200"
            />
          </div>

          {/* Tasks Done */}
          <div className="space-y-2">
            <Label htmlFor="taskDone" className="text-sm font-medium">
              Today's Work Done
            </Label>
            <Textarea
              id="taskDone"
              placeholder="Describe the work you completed today..."
              value={formData.taskDone}
              onChange={(e) => setFormData({ ...formData, taskDone: e.target.value })}
              required
              className="min-h-24 border-gray-200"
            />
          </div>

          {/* Research Done */}
          <div className="space-y-2">
            <Label htmlFor="researchDone" className="text-sm font-medium">
              Today's Research Done (if any)
            </Label>
            <Textarea
              id="researchDone"
              placeholder="Document any research or learning activities..."
              value={formData.researchDone}
              onChange={(e) => setFormData({ ...formData, researchDone: e.target.value })}
              className="min-h-20 border-gray-200"
            />
          </div>

          {/* Remarks Section */}
          <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-900 rounded-lg p-4 space-y-4">
            <h4 className="font-semibold text-amber-900 dark:text-amber-100 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Remarks & Time Analysis
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="timeTaken" className="text-sm font-medium">
                  Time Actually Taken (hours)
                </Label>
                <Input
                  id="timeTaken"
                  type="number"
                  min="0"
                  max="24"
                  step="0.5"
                  value={formData.remarks.timeTaken}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      remarks: { ...formData.remarks, timeTaken: Number.parseFloat(e.target.value) },
                    })
                  }
                  className="border-amber-200 dark:border-amber-900"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timeExpected" className="text-sm font-medium">
                  Time Expected (hours)
                </Label>
                <Input
                  id="timeExpected"
                  type="number"
                  min="0"
                  max="24"
                  step="0.5"
                  value={formData.remarks.timeExpected}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      remarks: { ...formData.remarks, timeExpected: Number.parseFloat(e.target.value) },
                    })
                  }
                  className="border-amber-200 dark:border-amber-900"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason" className="text-sm font-medium">
                Why did it take more/less time? (Please explain)
              </Label>
              <Textarea
                id="reason"
                placeholder="e.g., Unexpected bugs, quick implementation, interruptions..."
                value={formData.remarks.reason}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    remarks: { ...formData.remarks, reason: e.target.value },
                  })
                }
                required
                className="min-h-20 border-amber-200 dark:border-amber-900"
              />
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
            {loading ? "Saving..." : initialData?.id ? "Update Task" : "Submit Task"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
