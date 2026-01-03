"use client"

import { useState, useEffect } from "react"
import { useAttendance } from "@/app/contexts/AttendanceContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Calendar, Download, Search, MapPin, Clock, Eye } from "lucide-react"
import { format } from "date-fns"
import { EmployeeDetailModal } from "./EmployeeDetailModal"
import type { AttendanceRecord } from "@/types/attendance"

export function AttendanceTable() {
  const { getRecordsByDate, getEmployeeRecords } = useAttendance()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"))
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<{
    name: string
    employeeId: string
    records: AttendanceRecord[]
  } | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const fetchRecords = async () => {
      setIsLoading(true)
      try {
        const fetchedRecords = await getRecordsByDate(selectedDate)
        setRecords(fetchedRecords)
      } catch (error) {
        console.error("[v0] Error fetching records:", error)
        setRecords([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchRecords()
  }, [selectedDate, getRecordsByDate])

  const filteredRecords = records.filter((record) => {
    const matchesSearch = record.employeeName.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const handleViewEmployee = (employeeName: string, employeeId: string) => {
    const fetchEmployeeRecords = async () => {
      try {
        console.log("[v0] Fetching records for employee:", employeeId, employeeName)
        const employeeRecords = await getEmployeeRecords(employeeId)
        console.log("[v0] Fetched employee records:", employeeRecords.length)
        setSelectedEmployee({
          name: employeeName,
          employeeId: employeeId,
          records: employeeRecords,
        })
        setIsModalOpen(true)
      } catch (error) {
        console.error("[v0] Error fetching employee records:", error)
        setSelectedEmployee({
          name: employeeName,
          employeeId: employeeId,
          records: [],
        })
        setIsModalOpen(true)
      }
    }

    fetchEmployeeRecords()
  }

  const exportToCSV = () => {
    const headers = [
      "Employee",
      "Date",
      "Check In",
      "Check In Location",
      "Check Out",
      "Check Out Location",
      "Total Hours",
      "Status",
    ]
    const csvData = filteredRecords.map((record) => [
      record.employeeName,
      record.date,
      record.checkInTime ? format(new Date(record.checkInTime), "h:mm a") : "",
      record.checkInLocation?.address ||
        `${record.checkInLocation?.latitude}, ${record.checkInLocation?.longitude}` ||
        "",
      record.checkOutTime ? format(new Date(record.checkOutTime), "h:mm a") : "",
      record.checkOutLocation?.address ||
        `${record.checkOutLocation?.latitude}, ${record.checkOutLocation?.longitude}` ||
        "",
      record.totalHours?.toFixed(2) || "",
      record.status,
    ])

    const csvContent = [headers.join(","), ...csvData.map((row) => row.map((cell) => `"${cell}"`).join(","))].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `attendance_${selectedDate}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "checked-in":
        return <Badge className="bg-success/10 text-success border-success/20 hover:bg-success/20">Working</Badge>
      case "checked-out":
        return <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">Completed</Badge>
      default:
        return <Badge variant="secondary">Absent</Badge>
    }
  }

  return (
    <>
      <Card className="border-border/50 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Attendance Records
            </CardTitle>
            <Button variant="outline" size="sm" onClick={exportToCSV} className="gap-2 bg-transparent">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search employee..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="pl-10 w-full sm:w-auto"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Employee</TableHead>
                  <TableHead className="font-semibold">Check In</TableHead>
                  <TableHead className="font-semibold hidden md:table-cell">Location</TableHead>
                  <TableHead className="font-semibold">Check Out</TableHead>
                  <TableHead className="font-semibold hidden md:table-cell">Location</TableHead>
                  <TableHead className="font-semibold text-right">Hours</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold text-center">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Loading records...
                    </TableCell>
                  </TableRow>
                ) : filteredRecords.length > 0 ? (
                  filteredRecords.map((record, index) => (
                    <TableRow key={record.id} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                      <TableCell className="font-medium">{record.employeeName}</TableCell>
                      <TableCell>
                        {record.checkInTime ? (
                          <span className="text-success font-medium">
                            {format(new Date(record.checkInTime), "h:mm a")}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">--</span>
                        )}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {record.checkInLocation && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1 max-w-[150px] truncate">
                            <MapPin className="h-3 w-3 shrink-0" />
                            {record.checkInLocation.address ||
                              `${record.checkInLocation.latitude.toFixed(4)}, ${record.checkInLocation.longitude.toFixed(4)}`}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {record.checkOutTime ? (
                          <span className="text-warning font-medium">
                            {format(new Date(record.checkOutTime), "h:mm a")}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">--</span>
                        )}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {record.checkOutLocation && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1 max-w-[150px] truncate">
                            <MapPin className="h-3 w-3 shrink-0" />
                            {record.checkOutLocation.address ||
                              `${record.checkOutLocation.latitude.toFixed(4)}, ${record.checkOutLocation.longitude.toFixed(4)}`}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-primary">
                        {record.totalHours ? `${record.totalHours.toFixed(1)}h` : "--"}
                      </TableCell>
                      <TableCell>{getStatusBadge(record.status)}</TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewEmployee(record.employeeName, record.employeeId)}
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No records found for {format(new Date(selectedDate), "MMMM d, yyyy")}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {selectedEmployee && (
        <EmployeeDetailModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedEmployee(null)
          }}
          employeeName={selectedEmployee.name}
          employeeId={selectedEmployee.employeeId}
          records={selectedEmployee.records}
        />
      )}
    </>
  )
}
