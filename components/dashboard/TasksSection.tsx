"use client"

import { FileText } from "lucide-react"
import { DailyTaskForm } from "@/components/tasks/DailyTaskForm"
import { TaskList } from "@/components/tasks/TaskList"
import { useAuth } from "@/app/contexts/AuthContext"

export function TasksSection() {
  const { user } = useAuth()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-8 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <FileText className="w-8 h-8" />
          Daily Work Sheets
        </h1>
        <p className="text-green-100">Log your daily tasks, projects, and research work</p>
      </div>

      {/* Task Form */}
      <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-md border border-slate-200 dark:border-slate-700">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Create Daily Task</h2>
        <DailyTaskForm employeeId={user?.id} onSuccess={() => window.location.reload()} />
      </div>

      {/* Task List */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-slate-200 dark:border-slate-700">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Your Work Sheets</h2>
        <TaskList employeeId={user?.id} />
      </div>
    </div>
  )
}
