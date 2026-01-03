"use client"

import { useAuth } from "@/app/contexts/AuthContext"
import { useAttendance } from "@/app/contexts/AttendanceContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, MapPin, Timer, Calendar } from "lucide-react"
import { format } from "date-fns"

export function DailySummary() {
  const { user } = useAuth()
  const { getTodayRecordForEmployee } = useAttendance()

  const todayRecord = user ? getTodayRecordForEmployee(user.id) : null

  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case "checked-in":
        return "bg-success/10 text-success border-success/20"
      case "checked-out":
        return "bg-primary/10 text-primary border-primary/20"
      default:
        return "bg-muted text-muted-foreground border-border"
    }
  }

  const getStatusText = (status: string | undefined) => {
    switch (status) {
      case "checked-in":
        return "Currently Working"
      case "checked-out":
        return "Day Completed"
      default:
        return "Not Checked In"
    }
  }

  const calculateWorkingTime = () => {
    if (!todayRecord?.checkInTime) return null

    const endTime = todayRecord.checkOutTime || new Date()
    const diffMs = endTime.getTime() - todayRecord.checkInTime.getTime()
    const hours = Math.floor(diffMs / (1000 * 60 * 60))
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

    return `${hours}h ${minutes}m`
  }

  return (
    <Card className="border-border/50 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Today's Summary
          </CardTitle>
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium border ${getStatusColor(todayRecord?.status)}`}
          >
            {getStatusText(todayRecord?.status)}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {todayRecord ? (
          <>
            {/* Check In Info */}
            <div className="flex items-start gap-4 p-4 rounded-xl bg-success/5 border border-success/10">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-success/10">
                <Clock className="h-5 w-5 text-success" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">Check In</p>
                <p className="text-lg font-bold text-success">{format(todayRecord.checkInTime!, "h:mm a")}</p>
                {todayRecord.checkInLocation?.address && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1 truncate">
                    <MapPin className="h-3 w-3 shrink-0" />
                    <span className="truncate">{todayRecord.checkInLocation.address}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Check Out Info */}
            <div
              className={`flex items-start gap-4 p-4 rounded-xl ${todayRecord.checkOutTime ? "bg-warning/5 border border-warning/10" : "bg-muted/50 border border-border/50"}`}
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${todayRecord.checkOutTime ? "bg-warning/10" : "bg-muted"}`}
              >
                <Clock className={`h-5 w-5 ${todayRecord.checkOutTime ? "text-warning" : "text-muted-foreground"}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">Check Out</p>
                {todayRecord.checkOutTime ? (
                  <>
                    <p className="text-lg font-bold text-warning">{format(todayRecord.checkOutTime, "h:mm a")}</p>
                    {todayRecord.checkOutLocation?.address && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1 truncate">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="truncate">{todayRecord.checkOutLocation.address}</span>
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-lg font-medium text-muted-foreground">--:-- --</p>
                )}
              </div>
            </div>

            {/* Working Hours */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-primary/5 border border-primary/10">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Timer className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {todayRecord.status === "checked-out" ? "Total Hours" : "Time Elapsed"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {todayRecord.status === "checked-out" ? "Completed" : "In progress"}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">{calculateWorkingTime() || "--"}</p>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-lg font-medium text-foreground mb-1">No check-in yet</p>
            <p className="text-sm text-muted-foreground">Tap the CHECK IN button to start your day</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
