"use client"

import { useState } from "react"
import { AppHeader } from "@/components/layout/AppHeader"
import { AdminStats } from "@/components/admin/AdminStats"
import { AttendanceTable } from "@/components/admin/AttendanceTable"
import { AddEmployeeModal } from "@/components/admin/AddEmployeeModal"
import { AnalyticsDashboard } from "@/components/admin/AnalyticsDashboard"
import { EmployeeDirectory } from "@/components/admin/EmployeeDirectory"
import { PerformanceMetrics } from "@/components/admin/PerformanceMetrics"
import { TaskApprovalDashboard } from "@/components/admin/TaskApprovalDashboard"
import { AdminEditorSheets } from "@/components/admin/AdminEditorSheets"
import { useAuth } from "@/app/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, UserPlus, BarChart3, Users, Clock, Zap, FileText, Layout } from "lucide-react"

export default function AdminDashboard() {
  const { user } = useAuth()
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  const handleEmployeeAdded = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Admin Dashboard</h2>
              <p className="text-muted-foreground">Manage attendance, employees, and tasks</p>
            </div>
          </div>

          <Button onClick={() => setIsAddEmployeeOpen(true)} className="gap-2">
            <UserPlus className="h-4 w-4" />
            Add Employee
          </Button>
        </div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="performance" className="gap-2">
              <Zap className="h-4 w-4" />
              <span className="hidden sm:inline">Performance</span>
            </TabsTrigger>
            <TabsTrigger value="attendance" className="gap-2">
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">Attendance</span>
            </TabsTrigger>
            <TabsTrigger value="tasks" className="gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Tasks</span>
            </TabsTrigger>
            <TabsTrigger value="editor-sheets" className="gap-2">
              <Layout className="h-4 w-4" />
              <span className="hidden sm:inline">Editor Sheets</span>
            </TabsTrigger>
            <TabsTrigger value="employees" className="gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Employees</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 animate-fade-in">
            <div>
              <AnalyticsDashboard />
            </div>

            <div>
              <AdminStats />
            </div>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="animate-fade-in">
            <PerformanceMetrics />
          </TabsContent>

          {/* Attendance Tab */}
          <TabsContent value="attendance" className="animate-fade-in">
            <AttendanceTable />
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="animate-fade-in">
            <TaskApprovalDashboard />
          </TabsContent>

          {/* Editor Sheets Tab */}
          <TabsContent value="editor-sheets" className="animate-fade-in">
            <AdminEditorSheets />
          </TabsContent>

          {/* Employees Tab */}
          <TabsContent value="employees" className="animate-fade-in">
            <EmployeeDirectory />
          </TabsContent>
        </Tabs>

        <AddEmployeeModal
          open={isAddEmployeeOpen}
          onOpenChange={setIsAddEmployeeOpen}
          onSuccess={handleEmployeeAdded}
        />
      </main>
    </div>
  )
}
