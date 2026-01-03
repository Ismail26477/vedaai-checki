"use client"

import { useState } from "react"
import { DashboardNav } from "@/components/dashboard/DashboardNav"
import { OverviewSection } from "@/components/dashboard/OverviewSection"
import { AttendanceSection } from "@/components/dashboard/AttendanceSection"
import { TasksSection } from "@/components/dashboard/TasksSection"
import { EditorSheetManager } from "@/components/editor/EditorSheetManager"
import { useAuth } from "@/app/contexts/AuthContext"

export default function EmployeeDashboard() {
  const [activeTab, setActiveTab] = useState<"attendance" | "tasks" | "overview" | "editor-sheets">("overview")
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <DashboardNav activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="container max-w-7xl mx-auto px-4 py-8">
        {activeTab === "overview" && <OverviewSection />}
        {activeTab === "attendance" && <AttendanceSection />}
        {activeTab === "tasks" && <TasksSection />}
        {activeTab === "editor-sheets" && <EditorSheetManager />}
      </main>
    </div>
  )
}
