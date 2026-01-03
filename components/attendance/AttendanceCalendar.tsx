"use client"

import { useState, useEffect } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { attendanceApi } from "@/app/lib/api"
import { useAuth } from "@/app/contexts/AuthContext"
import { format, isToday, parseISO } from "date-fns"
import { CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react"

interface AttendanceDay {
  date: Date
  status: "present" | "absent" | "late" | "half-day" | null
  checkInTime?: Date
  checkOutTime?: Date
  totalHours?: number
}

export function AttendanceCalendar() {
  const { user } = useAuth()
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [attendanceData, setAttendanceData] = useState<Map<string, AttendanceDay>>(new Map())
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDayDetails, setSelectedDayDetails] = useState<AttendanceDay | null>(null)

  useEffect(() => {
    const fetchAttendanceData = async () => {
      if (!user?.id || user.id === "undefined") return
      setIsLoading(true)
      try {
        const records = await attendanceApi.getEmployeeRecords(user.id)
        if (records && records.length > 0) {
          const dataMap = new Map<string, AttendanceDay>()

          records.forEach((record: any) => {
            const dateKey = record.date || format(new Date(record.checkInTime), "yyyy-MM-dd")
            let status: "present" | "absent" | "late" | "half-day" | null = null

            if (record.status === "checked-out") {
              const checkInTime = new Date(record.checkInTime)
              // Assume work starts at 9 AM
              status = checkInTime.getHours() > 9 ? "late" : "present"
            } else if (record.status === "checked-in") {
              status = "half-day"
            } else if (record.status === "absent") {
              status = "absent"
            }

            dataMap.set(dateKey, {
              date: parseISO(dateKey),
              status,
              checkInTime: record.checkInTime ? new Date(record.checkInTime) : undefined,
              checkOutTime: record.checkOutTime ? new Date(record.checkOutTime) : undefined,
              totalHours: record.totalHours,
            })
          })

          setAttendanceData(dataMap)
        }
      } catch (error) {
        console.error("[v0] Error fetching attendance data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAttendanceData()
  }, [user])

  // Update selected day details when date changes
  useEffect(() => {
    if (selectedDate) {
      const dateKey = format(selectedDate, "yyyy-MM-dd")
      const dayData = attendanceData.get(dateKey)
      setSelectedDayDetails(dayData || null)
    }
  }, [selectedDate, attendanceData])

  // Custom day renderer with color coding
  const getDayClassName = (date: Date) => {
    const dateKey = format(date, "yyyy-MM-dd")
    const dayData = attendanceData.get(dateKey)

    if (!dayData) return ""

    const baseClass = "h-9 w-9 p-0 font-normal relative flex items-center justify-center"

    switch (dayData.status) {
      case "present":
        return `${baseClass} bg-green-500/20 text-green-700 font-semibold`
      case "late":
        return `${baseClass} bg-yellow-500/20 text-yellow-700 font-semibold`
      case "absent":
        return `${baseClass} bg-red-500/20 text-red-700 font-semibold`
      case "half-day":
        return `${baseClass} bg-blue-500/20 text-blue-700 font-semibold`
      default:
        return baseClass
    }
  }

  const getStatusBadge = (status: string | null | undefined) => {
    switch (status) {
      case "present":
        return (
          <Badge className="bg-green-500/10 text-green-700 hover:bg-green-500/20 flex gap-1">
            <CheckCircle2 className="h-4 w-4" />
            Present
          </Badge>
        )
      case "late":
        return (
          <Badge className="bg-yellow-500/10 text-yellow-700 hover:bg-yellow-500/20 flex gap-1">
            <Clock className="h-4 w-4" />
            Late Arrival
          </Badge>
        )
      case "absent":
        return (
          <Badge className="bg-red-500/10 text-red-700 hover:bg-red-500/20 flex gap-1">
            <XCircle className="h-4 w-4" />
            Absent
          </Badge>
        )
      case "half-day":
        return (
          <Badge className="bg-blue-500/10 text-blue-700 hover:bg-blue-500/20 flex gap-1">
            <AlertCircle className="h-4 w-4" />
            Half Day
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 xl:gap-8">
      {/* Calendar */}
      <Card className="xl:col-span-1">
        <CardHeader>
          <CardTitle>Attendance Calendar</CardTitle>
          <CardDescription>View your attendance history</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-64 flex items-center justify-center text-muted-foreground">Loading calendar...</div>
          ) : (
            <div>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="w-full"
                classNames={{
                  day_selected: getDayClassName(selectedDate || new Date()),
                  cell: "h-10 w-10 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-transparent focus-within:relative focus-within:z-20",
                  day: `${getDayClassName(selectedDate || new Date())} aria-selected:opacity-100 aria-selected:bg-primary/20`,
                }}
                disabled={(date) => date > new Date()}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details Panel */}
      <div className="xl:col-span-2 space-y-4">
        {selectedDate && (
          <>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{format(selectedDate, "EEEE, MMMM d, yyyy")}</CardTitle>
                    <CardDescription>{isToday(selectedDate) ? "Today" : ""}</CardDescription>
                  </div>
                  {selectedDayDetails && getStatusBadge(selectedDayDetails.status)}
                </div>
              </CardHeader>
              <CardContent>
                {selectedDayDetails ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-lg bg-muted/50 p-4">
                        <p className="text-sm font-medium text-muted-foreground">Check-in Time</p>
                        <p className="text-2xl font-bold mt-1">
                          {selectedDayDetails.checkInTime ? format(selectedDayDetails.checkInTime, "hh:mm a") : "—"}
                        </p>
                      </div>
                      <div className="rounded-lg bg-muted/50 p-4">
                        <p className="text-sm font-medium text-muted-foreground">Check-out Time</p>
                        <p className="text-2xl font-bold mt-1">
                          {selectedDayDetails.checkOutTime ? format(selectedDayDetails.checkOutTime, "hh:mm a") : "—"}
                        </p>
                      </div>
                    </div>
                    {selectedDayDetails.totalHours && (
                      <div className="rounded-lg bg-primary/10 p-4">
                        <p className="text-sm font-medium text-muted-foreground">Total Hours</p>
                        <p className="text-2xl font-bold text-primary mt-1">
                          {selectedDayDetails.totalHours.toFixed(1)} hours
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    <XCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No attendance record for this date</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Legend */}
            <Card>
              <CardHeader>
                <CardTitle>Legend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded bg-green-500/20 flex items-center justify-center">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    </div>
                    <span className="text-sm">Present - Checked in on time</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded bg-yellow-500/20 flex items-center justify-center">
                      <Clock className="h-4 w-4 text-yellow-600" />
                    </div>
                    <span className="text-sm">Late - Checked in after 9 AM</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded bg-blue-500/20 flex items-center justify-center">
                      <AlertCircle className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-sm">Half Day - Checked in but not checked out</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded bg-red-500/20 flex items-center justify-center">
                      <XCircle className="h-4 w-4 text-red-600" />
                    </div>
                    <span className="text-sm">Absent - No check-in record</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
