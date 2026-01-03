"use client"

import { useAuth } from "@/app/contexts/AuthContext"
import { useAttendance } from "@/app/contexts/AttendanceContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { History, Clock, Timer } from "lucide-react"
import { format } from "date-fns"
import { useState, useEffect } from "react"
import type { AttendanceRecord } from "@/types/attendance"

export function AttendanceHistory() {
  const { user } = useAuth()
  const { getEmployeeRecords } = useAttendance()
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchRecords = async () => {
      if (!user || !user.id || user.id === "undefined") {
        setRecords([])
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      try {
        const employeeRecords = await getEmployeeRecords(user.id)
        setRecords(employeeRecords)
      } catch (error) {
        console.error("[v0] Error fetching employee records:", error)
        setRecords([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchRecords()
  }, [user, getEmployeeRecords])

  const recentRecords = records.slice(0, 5)

  return (
    <Card className="border-border/50 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          Recent History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-3">
              <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="text-sm text-muted-foreground">Loading history...</p>
          </div>
        ) : recentRecords.length > 0 ? (
          <div className="space-y-3">
            {recentRecords.map((record, index) => (
              <div
                key={record.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50 animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center gap-3">
                  <div className="text-center min-w-[60px]">
                    <p className="text-xs font-medium text-muted-foreground">{format(new Date(record.date), "EEE")}</p>
                    <p className="text-sm font-bold text-foreground">{format(new Date(record.date), "MMM d")}</p>
                  </div>
                  <div className="h-8 w-px bg-border" />
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-success" />
                      <span className="text-foreground">
                        {record.checkInTime ? format(record.checkInTime, "h:mm a") : "--"}
                      </span>
                    </div>
                    <span className="text-muted-foreground">→</span>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-warning" />
                      <span className="text-foreground">
                        {record.checkOutTime ? format(record.checkOutTime, "h:mm a") : "--"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-sm font-medium text-primary">
                  <Timer className="h-3.5 w-3.5" />
                  {record.totalHours ? `${record.totalHours.toFixed(1)}h` : "--"}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-3">
              <History className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">No attendance history yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
