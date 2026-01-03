"use client"
import { Clock, FileText, BarChart3, LogOut, BrainCircuit, Layout } from "lucide-react"
import { useAuth } from "@/app/contexts/AuthContext"

interface DashboardNavProps {
  activeTab: "attendance" | "tasks" | "overview" | "editor-sheets"
  onTabChange: (tab: "attendance" | "tasks" | "overview" | "editor-sheets") => void
}

export function DashboardNav({ activeTab, onTabChange }: DashboardNavProps) {
  const { logout, user } = useAuth()

  const isEditor = user?.department?.toLowerCase() === "editor" || user?.role === "admin"

  return (
    <nav className="bg-[#0a0a0b] border-b border-white/5 shadow-2xl sticky top-0 z-50">
      <div className="container max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="text-white font-bold text-2xl flex items-center gap-2 tracking-tight">
              <div className="bg-primary p-1.5 rounded-lg shadow-lg shadow-primary/30">
                <BrainCircuit className="w-6 h-6 text-white" />
              </div>
              Vedaa AI
            </div>

            <div className="hidden md:flex gap-2">
              <button
                onClick={() => onTabChange("overview")}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  activeTab === "overview"
                    ? "bg-blue-500 text-white"
                    : "text-slate-300 hover:text-white hover:bg-slate-700"
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                Dashboard
              </button>
              <button
                onClick={() => onTabChange("attendance")}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  activeTab === "attendance"
                    ? "bg-blue-500 text-white"
                    : "text-slate-300 hover:text-white hover:bg-slate-700"
                }`}
              >
                <Clock className="w-4 h-4" />
                Attendance
              </button>
              <button
                onClick={() => onTabChange("tasks")}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  activeTab === "tasks"
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:text-white hover:bg-slate-800"
                }`}
              >
                <FileText className="w-4 h-4" />
                Daily Tasks
              </button>
              {isEditor && (
                <button
                  onClick={() => onTabChange("editor-sheets")}
                  className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                    activeTab === "editor-sheets"
                      ? "bg-blue-600 text-white"
                      : "text-slate-300 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <Layout className="w-4 h-4" />
                  Editor Sheets
                </button>
              )}
            </div>
          </div>

          <button
            onClick={() => logout()}
            className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition-all flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>

        {/* Mobile Tab Selector */}
        <div className="md:hidden flex gap-2 mt-4 overflow-x-auto pb-2">
          <button
            onClick={() => onTabChange("overview")}
            className={`px-3 py-1.5 rounded text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === "overview" ? "bg-blue-500 text-white" : "text-slate-300 hover:text-white hover:bg-slate-700"
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => onTabChange("attendance")}
            className={`px-3 py-1.5 rounded text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === "attendance"
                ? "bg-blue-500 text-white"
                : "text-slate-300 hover:text-white hover:bg-slate-700"
            }`}
          >
            Attendance
          </button>
          <button
            onClick={() => onTabChange("tasks")}
            className={`px-3 py-1.5 rounded text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === "tasks" ? "bg-blue-600 text-white" : "text-slate-300 hover:text-white hover:bg-slate-800"
            }`}
          >
            Tasks
          </button>
          {isEditor && (
            <button
              onClick={() => onTabChange("editor-sheets")}
              className={`px-3 py-1.5 rounded text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === "editor-sheets"
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:text-white hover:bg-slate-800"
              }`}
            >
              Editor Sheets
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}
