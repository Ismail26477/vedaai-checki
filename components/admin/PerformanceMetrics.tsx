"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { attendanceApi, usersApi } from "@/app/lib/api"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts"
import { Trophy, Award, Target, TrendingUp, Medal } from "lucide-react"

interface EmployeeMetrics {
  id: string
  name: string
  email: string
  attendanceRate: number
  onTimePercentage: number
  totalDaysWorked: number
  lateArrivals: number
  score: number
  rank: number
}

export function PerformanceMetrics() {
  const [leaderboard, setLeaderboard] = useState<EmployeeMetrics[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [topPerformers, setTopPerformers] = useState<EmployeeMetrics[]>([])
  const [metrics, setMetrics] = useState({
    avgAttendanceRate: 0,
    avgOnTimePercentage: 0,
    avgDaysWorked: 0,
  })

  useEffect(() => {
    const fetchPerformanceData = async () => {
      setIsLoading(true)
      try {
        const usersResponse = await usersApi.getAll()
        if (!usersResponse.success || !usersResponse.users) {
          setIsLoading(false)
          return
        }

        const employeeMetrics: EmployeeMetrics[] = []

        for (const user of usersResponse.users) {
          const records = await attendanceApi.getEmployeeRecords(user.id)

          if (records && records.length > 0) {
            const checkedOutCount = records.filter((r: any) => r.status === "checked-out").length
            const lateCount = records.filter((r: any) => {
              const checkInTime = new Date(r.checkInTime)
              return checkInTime.getHours() > 9
            }).length

            const attendanceRate = Math.round((checkedOutCount / records.length) * 100)
            const onTimePercentage = Math.round(((checkedOutCount - lateCount) / records.length) * 100)

            const score = Math.round(
              attendanceRate * 0.5 + // 50% weight on attendance
                onTimePercentage * 0.5, // 50% weight on punctuality
            )

            employeeMetrics.push({
              id: user.id,
              name: user.name,
              email: user.email,
              attendanceRate,
              onTimePercentage,
              totalDaysWorked: records.length,
              lateArrivals: lateCount,
              score,
              rank: 0,
            })
          }
        }

        employeeMetrics.sort((a, b) => b.score - a.score)
        employeeMetrics.forEach((emp, index) => {
          emp.rank = index + 1
        })

        setLeaderboard(employeeMetrics)
        setTopPerformers(employeeMetrics.slice(0, 5))

        if (employeeMetrics.length > 0) {
          const avgAttendance = Math.round(
            employeeMetrics.reduce((sum, emp) => sum + emp.attendanceRate, 0) / employeeMetrics.length,
          )
          const avgOnTime = Math.round(
            employeeMetrics.reduce((sum, emp) => sum + emp.onTimePercentage, 0) / employeeMetrics.length,
          )
          const avgDays = Math.round(
            employeeMetrics.reduce((sum, emp) => sum + emp.totalDaysWorked, 0) / employeeMetrics.length,
          )

          setMetrics({
            avgAttendanceRate: avgAttendance,
            avgOnTimePercentage: avgOnTime,
            avgDaysWorked: avgDays,
          })
        }
      } catch (error) {
        console.error("[v0] Error fetching performance data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPerformanceData()
  }, [])

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const getMedalIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 3:
        return <Medal className="h-5 w-5 text-orange-600" />
      default:
        return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>
    }
  }

  const getRankColor = (rank: number) => {
    if (rank === 1) return "bg-yellow-500/10 border-yellow-500/20"
    if (rank === 2) return "bg-gray-500/10 border-gray-500/20"
    if (rank === 3) return "bg-orange-500/10 border-orange-500/20"
    return "bg-muted/50"
  }

  const radarData = topPerformers.map((emp) => ({
    name: emp.name,
    attendance: emp.attendanceRate,
    onTime: emp.onTimePercentage,
    score: emp.score,
  }))

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="shimmer h-32"></Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Average Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border/50 shadow-md hover:shadow-lg transition-all">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Avg. Attendance Rate</p>
                <p className="text-3xl font-bold text-green-600">{metrics.avgAttendanceRate}%</p>
                <p className="text-xs text-muted-foreground mt-2">Team average</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10">
                <Target className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-md hover:shadow-lg transition-all">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">On-Time Percentage</p>
                <p className="text-3xl font-bold text-blue-600">{metrics.avgOnTimePercentage}%</p>
                <p className="text-xs text-muted-foreground mt-2">Punctuality score</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-md hover:shadow-lg transition-all">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Avg. Days Worked</p>
                <p className="text-3xl font-bold text-purple-600">{metrics.avgDaysWorked}</p>
                <p className="text-xs text-muted-foreground mt-2">Per employee</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/10">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Top Performers
          </CardTitle>
          <CardDescription>Best performing employees this month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topPerformers.map((emp, index) => (
              <div
                key={emp.id}
                className={`flex items-center justify-between p-4 rounded-lg border border-border ${getRankColor(emp.rank)} animate-fade-in`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex items-center gap-2 w-12">{getMedalIcon(emp.rank)}</div>
                  <Avatar>
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {getInitials(emp.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{emp.name}</p>
                    <p className="text-sm text-muted-foreground">{emp.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Performance Score</p>
                    <p className="text-2xl font-bold text-primary">{emp.score}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart - Score Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Scores</CardTitle>
            <CardDescription>Top 5 employees comparison</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topPerformers}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }} />
                <Bar dataKey="score" fill="hsl(var(--primary))" name="Score" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Radar Chart - Multi-metric comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Metrics Comparison</CardTitle>
            <CardDescription>Attendance vs Punctuality</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="name" stroke="var(--muted-foreground)" />
                <PolarRadiusAxis stroke="var(--muted-foreground)" />
                <Radar
                  name="Attendance"
                  dataKey="attendance"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.5}
                />
                <Radar name="On-Time" dataKey="onTime" stroke="#10b981" fill="#10b981" fillOpacity={0.5} />
                <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Full Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle>Full Leaderboard</CardTitle>
          <CardDescription>All employees ranked by performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="space-y-2">
              {leaderboard.map((emp, index) => (
                <div
                  key={emp.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors animate-fade-in"
                  style={{ animationDelay: `${Math.min(index * 30, 500)}ms` }}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-8 text-center font-bold text-muted-foreground">#{emp.rank}</div>
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">
                        {getInitials(emp.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{emp.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 ml-4">
                    <div className="text-right hidden sm:block">
                      <p className="text-xs text-muted-foreground">Attendance</p>
                      <p className="font-semibold text-sm">{emp.attendanceRate}%</p>
                    </div>
                    <div className="text-right hidden sm:block">
                      <p className="text-xs text-muted-foreground">On-Time</p>
                      <p className="font-semibold text-sm">{emp.onTimePercentage}%</p>
                    </div>
                    <div className="w-16 text-right">
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                        {emp.score}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
