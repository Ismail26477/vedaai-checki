"use client"

import { useAttendance } from "@/app/contexts/AttendanceContext"
import { Card, CardContent } from "@/components/ui/card"
import { Users, UserCheck, Clock, Timer } from "lucide-react"
import { useEffect, useState } from "react"
import { attendanceApi, usersApi } from "@/app/lib/api"

export function AdminStats() {
  const { records } = useAttendance()
  const [totalEmployees, setTotalEmployees] = useState(0)
  const [stats, setStats] = useState({
    presentToday: 0,
    checkedOut: 0,
    avgHours: 0,
  })

  useEffect(() => {
    const fetchTotalEmployees = async () => {
      try {
        const response = await usersApi.getAll()
        if (response.success && response.users) {
          setTotalEmployees(response.users.length)
        }
      } catch (error) {
        console.error("[v0] Error fetching users:", error)
      }
    }
    fetchTotalEmployees()
  }, [])

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await attendanceApi.getStats()
        if (response.success && response.stats) {
          setStats({
            presentToday: response.stats.presentToday || 0,
            checkedOut: response.stats.checkedOut || 0,
            avgHours: response.stats.avgWorkHours || 0,
          })
        }
      } catch (error) {
        console.error("[v0] Error fetching stats:", error)
      }
    }
    fetchStats()
  }, [records])

  const statsData = [
    {
      label: "Total Employees",
      value: totalEmployees.toString(),
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Present Today",
      value: stats.presentToday.toString(),
      icon: UserCheck,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      label: "Checked Out",
      value: stats.checkedOut.toString(),
      icon: Clock,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      label: "Avg. Hours",
      value: stats.avgHours.toFixed(1),
      icon: Timer,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statsData.map((stat, index) => (
        <Card
          key={stat.label}
          className="border-border/50 shadow-md hover:shadow-lg transition-shadow animate-fade-in"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">{stat.label}</p>
                <p className={`text-xl sm:text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
