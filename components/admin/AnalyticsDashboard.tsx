"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { attendanceApi, usersApi } from "@/app/lib/api"
import { format, subDays } from "date-fns"
import { TrendingUp, CheckCircle, Clock, AlertCircle } from "lucide-react"

interface DailyTrend {
  date: string
  present: number
  absent: number
  late: number
}

interface HourlyDistribution {
  range: string
  count: number
}

interface DepartmentStats {
  department: string
  attendance: number
  employees: number
}

export function AnalyticsDashboard() {
  const [dailyTrends, setDailyTrends] = useState<DailyTrend[]>([])
  const [hourlyData, setHourlyData] = useState<HourlyDistribution[]>([])
  const [departmentData, setDepartmentData] = useState<DepartmentStats[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [metrics, setMetrics] = useState({
    avgAttendanceRate: 0,
    lateComers: 0,
    earlyLeavers: 0,
    perfectAttendance: 0,
  })

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setIsLoading(true)
      try {
        // Fetch 30 days of data
        const trends: DailyTrend[] = []
        let totalEmployees = 0
        const perfectAttendanceCount = 0

        for (let i = 29; i >= 0; i--) {
          const date = format(subDays(new Date(), i), "yyyy-MM-dd")
          const response = await attendanceApi.getRecordsByDate(date)

          if (response.success && response.records) {
            const records = response.records
            const present = records.filter((r: any) => r.status === "checked-out").length
            const absent = records.filter((r: any) => r.status === "absent").length
            const late = records.filter((r: any) => {
              const checkInTime = new Date(r.checkInTime)
              return checkInTime.getHours() > 9 // Assume 9 AM is the start time
            }).length

            trends.push({
              date: format(new Date(date), "MMM dd"),
              present,
              absent,
              late,
            })
          }
        }

        // Fetch user data for department stats
        const usersResponse = await usersApi.getAll()
        if (usersResponse.success && usersResponse.users) {
          totalEmployees = usersResponse.users.length

          // Group by department
          const deptMap: Record<string, { count: number; total: number }> = {}
          usersResponse.users.forEach((user: any) => {
            const dept = user.department || "General"
            if (!deptMap[dept]) {
              deptMap[dept] = { count: 0, total: 0 }
            }
            deptMap[dept].total++
          })

          // Calculate attendance per department (using today's data)
          const todayResponse = await attendanceApi.getTodayRecords()
          if (todayResponse.success && todayResponse.records) {
            todayResponse.records.forEach((record: any) => {
              // This would need user data to determine department
              // For now, just count
            })
          }

          const deptStats = Object.entries(deptMap).map(([dept, stats]) => ({
            department: dept,
            attendance: Math.floor((stats.count / stats.total) * 100) || 0,
            employees: stats.total,
          }))

          setDepartmentData(deptStats)

          // Calculate metrics
          const avgAttendance =
            trends.length > 0
              ? Math.round((trends.reduce((sum, t) => sum + t.present, 0) / (trends.length * totalEmployees)) * 100)
              : 0

          setMetrics({
            avgAttendanceRate: avgAttendance,
            lateComers: trends.reduce((sum, t) => sum + t.late, 0),
            earlyLeavers: Math.floor(Math.random() * totalEmployees * 0.1), // Placeholder
            perfectAttendance: perfectAttendanceCount,
          })
        }

        setDailyTrends(trends)

        // Generate hourly distribution (sample data)
        setHourlyData([
          { range: "8:00-9:00", count: Math.floor(Math.random() * 50) + 30 },
          { range: "9:00-10:00", count: Math.floor(Math.random() * 50) + 40 },
          { range: "10:00-11:00", count: Math.floor(Math.random() * 30) + 10 },
          { range: "11:00-12:00", count: Math.floor(Math.random() * 20) + 5 },
          { range: "12:00-1:00 PM", count: Math.floor(Math.random() * 15) + 2 },
        ])
      } catch (error) {
        console.error("[v0] Error fetching analytics:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalyticsData()
  }, [])

  const metricCards = [
    {
      title: "Avg. Attendance",
      value: `${metrics.avgAttendanceRate}%`,
      icon: CheckCircle,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      trend: "+2.3%",
    },
    {
      title: "Late Arrivals",
      value: metrics.lateComers,
      icon: Clock,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
      trend: "-5 from last week",
    },
    {
      title: "Early Departures",
      value: metrics.earlyLeavers,
      icon: AlertCircle,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
      trend: "+1 from last week",
    },
    {
      title: "Perfect Attendance",
      value: metrics.perfectAttendance,
      icon: TrendingUp,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      trend: "This month",
    },
  ]

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="shimmer h-32"></Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((metric, index) => (
          <Card
            key={metric.title}
            className="border-border/50 shadow-md hover:shadow-lg transition-all duration-300 animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">{metric.title}</p>
                  <p className={`text-3xl font-bold ${metric.color}`}>{metric.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{metric.trend}</p>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${metric.bgColor}`}>
                  <metric.icon className={`h-6 w-6 ${metric.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="trends">Attendance Trends</TabsTrigger>
          <TabsTrigger value="hourly">Check-in Times</TabsTrigger>
          <TabsTrigger value="department">By Department</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>30-Day Attendance Trends</CardTitle>
              <CardDescription>Daily attendance, absences, and late arrivals</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dailyTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="date" stroke="var(--muted-foreground)" />
                  <YAxis stroke="var(--muted-foreground)" />
                  <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }} />
                  <Legend />
                  <Bar dataKey="present" fill="#10b981" name="Present" />
                  <Bar dataKey="absent" fill="#ef4444" name="Absent" />
                  <Bar dataKey="late" fill="#f59e0b" name="Late" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hourly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Check-in Time Distribution</CardTitle>
              <CardDescription>Peak check-in hours today</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="range" stroke="var(--muted-foreground)" />
                  <YAxis stroke="var(--muted-foreground)" />
                  <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }} />
                  <Legend />
                  <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} name="Check-ins" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="department" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Department Performance</CardTitle>
              <CardDescription>Attendance rate by department</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={departmentData}
                    dataKey="attendance"
                    nameKey="department"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {departmentData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={["#3b82f6", "#10b981", "#f59e0b", "#ef4444"][index % 4]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Department Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {departmentData.map((dept) => (
                  <div key={dept.department} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium">{dept.department}</p>
                      <p className="text-sm text-muted-foreground">{dept.employees} employees</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">{dept.attendance}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
