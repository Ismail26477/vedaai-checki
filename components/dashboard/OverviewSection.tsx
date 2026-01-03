"use client"

import { useEffect, useState } from "react"
import { Clock, Calendar, CheckCircle, Zap, ArrowRight, History, ClipboardList, BrainCircuit } from "lucide-react"
import { useAuth } from "@/app/contexts/AuthContext"

export function OverviewSection() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    todayHours: "0h 0m",
    weekHours: "0h 0m",
    monthHours: "0h 0m",
    tasksCompleted: 0,
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (!user?.id || user.id === "undefined") return

        const response = await fetch(`/api/attendance/stats?employeeId=${user.id}`)
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error("Error fetching stats:", error)
      }
    }
    if (user?.id) fetchStats()
  }, [user?.id])

  return (
    <div className="space-y-8">
      {/* Welcome Header - Enhanced AI Aesthetic */}
      <div className="relative overflow-hidden bg-[#0c0c0e] border border-white/5 text-white p-10 rounded-3xl shadow-2xl group">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] -mr-48 -mt-48 transition-all duration-700 group-hover:bg-primary/30" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-4">
              <Zap className="w-3 h-3" /> System Active
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
              Welcome back, <span className="text-primary">{user?.name?.split(" ")[0]}</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-xl">
              Your intelligent workspace is ready. You have tracked{" "}
              <span className="text-white font-semibold">{stats.tasksCompleted} tasks</span> this month.
            </p>
          </div>
          <div className="flex gap-4">
            <div className="h-16 w-16 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center">
              <BrainCircuit className="w-8 h-8 text-primary" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid - Modern Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: "Today's Hours", val: stats.todayHours, icon: Clock, color: "text-blue-400", bg: "bg-blue-400/10" },
          {
            label: "This Week",
            val: stats.weekHours,
            icon: Calendar,
            color: "text-indigo-400",
            bg: "bg-indigo-400/10",
          },
          {
            label: "This Month",
            val: stats.monthHours,
            icon: Calendar,
            color: "text-purple-400",
            bg: "bg-purple-400/10",
          },
          {
            label: "Tasks Done",
            val: stats.tasksCompleted,
            icon: CheckCircle,
            color: "text-emerald-400",
            bg: "bg-emerald-400/10",
          },
        ].map((item, i) => (
          <div key={i} className="glass-card p-6 rounded-2xl hover:border-primary/50 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${item.bg}`}>
                <item.icon className={`w-6 h-6 ${item.color}`} />
              </div>
              <div className="h-1 w-8 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-primary w-2/3" />
              </div>
            </div>
            <p className="text-muted-foreground text-sm font-medium">{item.label}</p>
            <p className="text-3xl font-bold mt-1 group-hover:translate-x-1 transition-transform">{item.val}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions - Polished Buttons */}
      <div className="glass-card p-8 rounded-3xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Productivity Hub
          </h3>
          <span className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Quick Access</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-between p-5 rounded-2xl bg-primary hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 text-white font-bold group">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-white/20 rounded-lg">
                <Clock className="w-5 h-5" />
              </div>
              <span>Clock In Now</span>
            </div>
            <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
          </button>

          <button className="flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all text-white font-bold group">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-white/5 rounded-lg">
                <ClipboardList className="w-5 h-5 text-emerald-400" />
              </div>
              <span>Log Daily Task</span>
            </div>
            <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
          </button>

          <button className="flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all text-white font-bold group">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-white/5 rounded-lg">
                <History className="w-5 h-5 text-purple-400" />
              </div>
              <span>View History</span>
            </div>
            <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
          </button>
        </div>
      </div>
    </div>
  )
}
