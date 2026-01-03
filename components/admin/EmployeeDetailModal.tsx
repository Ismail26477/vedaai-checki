"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { MapPin, Clock, Calendar, CheckCircle2, AlertCircle, Camera, RotateCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import type { AttendanceRecord } from "@/types/attendance"

interface EmployeeDetailModalProps {
  isOpen: boolean
  onClose: () => void
  employeeName: string
  employeeId: string
  records: AttendanceRecord[]
}

function EmployeeDetailModal({ isOpen, onClose, employeeName, employeeId, records }: EmployeeDetailModalProps) {
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null)
  const [displayRecords, setDisplayRecords] = useState<AttendanceRecord[]>(records)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setDisplayRecords(records)
      if (records.length > 0 && !selectedRecord) {
        setSelectedRecord(records[0])
      }
    }
  }, [records, isOpen])

  const refreshRecords = async () => {
    setIsRefreshing(true)
    try {
      const response = await fetch(`/api/attendance/employee/${employeeId}`)
      const data = await response.json()
      if (data.success && (data.data || data.records)) {
        const recordsList = data.data || data.records
        const mappedRecords = recordsList.map((r: any) => ({
          ...r,
          id: r._id || r.id,
          checkInTime: r.checkInTime ? new Date(r.checkInTime) : null,
          checkOutTime: r.checkOutTime ? new Date(r.checkOutTime) : null,
          photoData: r.photoData || null,
          checkOutPhotoData: r.checkOutPhotoData || null,
        }))
        console.log(
          "[v0] Refreshed records, checkout photos found:",
          mappedRecords.filter((r: any) => r.checkOutPhotoData).length,
        )
        setDisplayRecords(mappedRecords)
        if (mappedRecords.length > 0) {
          setSelectedRecord(mappedRecords[0])
        }
      }
    } catch (error) {
      console.error("[v0] Failed to refresh records:", error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const getAvatarColor = (name: string) => {
    const colors = ["bg-blue-500", "bg-purple-500", "bg-pink-500", "bg-green-500", "bg-orange-500"]
    const hash = name.charCodeAt(0) + name.charCodeAt(name.length - 1)
    return colors[hash % colors.length]
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "checked-in":
        return (
          <Badge className="bg-success/10 text-success border-success/20">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Working
          </Badge>
        )
      case "checked-out":
        return (
          <Badge className="bg-primary/10 text-primary border-primary/20">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary">
            <AlertCircle className="h-3 w-3 mr-1" />
            Absent
          </Badge>
        )
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" aria-describedby="employee-modal-description">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle id="employee-modal-title" className="flex items-center gap-3">
              <Avatar className={`h-10 w-10 ${getAvatarColor(employeeName)}`}>
                <AvatarFallback className="bg-current text-white font-bold">{getInitials(employeeName)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-lg font-semibold">{employeeName}</p>
                <p className="text-xs text-muted-foreground">ID: {employeeId}</p>
              </div>
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshRecords}
              disabled={isRefreshing}
              className="h-8 w-8 p-0"
              title="Refresh records to see latest photos"
            >
              <RotateCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            </Button>
          </div>
          <p id="employee-modal-description" className="sr-only">
            Employee attendance details and verification for {employeeName}
          </p>
        </DialogHeader>

        <Tabs defaultValue="records" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="records">Attendance Records</TabsTrigger>
            <TabsTrigger value="verification">Verification</TabsTrigger>
          </TabsList>

          <TabsContent value="records" className="space-y-4">
            {displayRecords.length > 0 ? (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {displayRecords.map((record, idx) => (
                  <Card
                    key={record.id}
                    className={`cursor-pointer transition-colors ${
                      selectedRecord?.id === record.id ? "border-primary bg-primary/5" : "hover:border-primary/50"
                    }`}
                    onClick={() => setSelectedRecord(record)}
                  >
                    <CardContent className="pt-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-sm">{format(new Date(record.date), "EEE, MMM d")}</span>
                          {getStatusBadge(record.status)}
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-xs text-muted-foreground">Check In</p>
                              <p className="font-medium">
                                {record.checkInTime ? format(new Date(record.checkInTime), "h:mm a") : "--"}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-xs text-muted-foreground">Check Out</p>
                              <p className="font-medium">
                                {record.checkOutTime ? format(new Date(record.checkOutTime), "h:mm a") : "--"}
                              </p>
                            </div>
                          </div>
                        </div>

                        {record.totalHours && (
                          <div className="flex items-center gap-2 pt-2 border-t">
                            <Calendar className="h-4 w-4 text-primary" />
                            <span className="text-sm font-semibold text-primary">
                              {record.totalHours.toFixed(1)} hours worked
                            </span>
                          </div>
                        )}

                        {record.checkInLocation && (
                          <div className="flex items-start gap-2 text-xs text-muted-foreground pt-2">
                            <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                            <span>
                              {record.checkInLocation.address ||
                                `${record.checkInLocation.latitude.toFixed(4)}, ${record.checkInLocation.longitude.toFixed(4)}`}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-muted/50 border-dashed">
                <CardContent className="pt-8 pb-8 text-center">
                  <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No attendance records found</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="verification" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Photo Verification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {(() => {
                  const recordsWithPhotos = displayRecords.filter((r) => r.photoData || r.checkOutPhotoData)
                  console.log("[v0] All records count:", displayRecords.length)
                  console.log("[v0] Records with checkin photos:", displayRecords.filter((r) => r.photoData).length)
                  console.log(
                    "[v0] Records with checkout photos:",
                    displayRecords.filter((r) => r.checkOutPhotoData).length,
                  )
                  console.log(
                    "[v0] Records with ANY photos:",
                    recordsWithPhotos.length,
                    "out of",
                    displayRecords.length,
                  )

                  displayRecords.forEach((r) => {
                    console.log(
                      `[v0] Record ${r.date}: checkin=${!!r.photoData}, checkout=${!!r.checkOutPhotoData}, status=${r.status}`,
                    )
                  })

                  return recordsWithPhotos.length > 0 ? (
                    <div className="space-y-6">
                      {recordsWithPhotos.map((record) => (
                        <div key={record.id} className="space-y-3">
                          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground border-b pb-2">
                            <Calendar className="h-4 w-4" />
                            <span>{format(new Date(record.date), "EEEE, MMMM d, yyyy")}</span>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            {record.photoData && (
                              <div className="space-y-2">
                                <div className="bg-muted rounded-lg overflow-hidden aspect-square border-2 border-success/30">
                                  <img
                                    src={record.photoData || "/placeholder.svg"}
                                    alt={`Check-in photo for ${employeeName} on ${record.date}`}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      console.error("[v0] Check-in photo failed to load for record:", record.id)
                                      const img = e.target as HTMLImageElement
                                      img.src = `/placeholder.svg?height=200&width=200&query=employee+checkin+photo`
                                    }}
                                    onLoad={() => {
                                      console.log(
                                        "[v0] Check-in photo loaded successfully for record:",
                                        record.id,
                                        record.date,
                                      )
                                    }}
                                  />
                                </div>
                                <div className="text-center">
                                  <p className="text-xs font-semibold text-success">Check-In</p>
                                  <p className="text-xs text-muted-foreground">
                                    {record.checkInTime ? format(new Date(record.checkInTime), "h:mm a") : "--"}
                                  </p>
                                </div>
                              </div>
                            )}

                            {record.checkOutPhotoData && (
                              <div className="space-y-2">
                                <div className="bg-muted rounded-lg overflow-hidden aspect-square border-2 border-warning/30">
                                  <img
                                    src={record.checkOutPhotoData || "/placeholder.svg"}
                                    alt={`Check-out photo for ${employeeName} on ${record.date}`}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      console.error("[v0] Check-out photo failed to load for record:", record.id)
                                      const img = e.target as HTMLImageElement
                                      img.src = `/placeholder.svg?height=200&width=200&query=employee+checkout+photo`
                                    }}
                                    onLoad={() => {
                                      console.log(
                                        "[v0] Check-out photo loaded successfully for record:",
                                        record.id,
                                        record.date,
                                      )
                                    }}
                                  />
                                </div>
                                <div className="text-center">
                                  <p className="text-xs font-semibold text-warning">Check-Out</p>
                                  <p className="text-xs text-muted-foreground">
                                    {record.checkOutTime ? format(new Date(record.checkOutTime), "h:mm a") : "--"}
                                  </p>
                                </div>
                              </div>
                            )}

                            {record.photoData && !record.checkOutPhotoData && (
                              <div className="space-y-2">
                                <div className="bg-muted/50 rounded-lg aspect-square border-2 border-dashed border-muted-foreground/20 flex items-center justify-center">
                                  <div className="text-center p-4">
                                    <Camera className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                                    <p className="text-xs text-muted-foreground">No check-out photo</p>
                                  </div>
                                </div>
                                <div className="text-center">
                                  <p className="text-xs font-semibold text-muted-foreground">Check-Out</p>
                                  <p className="text-xs text-muted-foreground">
                                    {record.checkOutTime ? format(new Date(record.checkOutTime), "h:mm a") : "Not yet"}
                                  </p>
                                </div>
                              </div>
                            )}

                            {!record.photoData && record.checkOutPhotoData && (
                              <div className="space-y-2">
                                <div className="bg-muted/50 rounded-lg aspect-square border-2 border-dashed border-muted-foreground/20 flex items-center justify-center">
                                  <div className="text-center p-4">
                                    <Camera className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                                    <p className="text-xs text-muted-foreground">No check-in photo</p>
                                  </div>
                                </div>
                                <div className="text-center">
                                  <p className="text-xs font-semibold text-muted-foreground">Check-In</p>
                                  <p className="text-xs text-muted-foreground">
                                    {record.checkInTime ? format(new Date(record.checkInTime), "h:mm a") : "--"}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-muted rounded-lg p-8 flex flex-col items-center justify-center min-h-[200px] border-2 border-dashed">
                      <Avatar className={`h-24 w-24 mb-4 ${getAvatarColor(employeeName)}`}>
                        <AvatarFallback className="bg-current text-white font-bold text-2xl">
                          {getInitials(employeeName)}
                        </AvatarFallback>
                      </Avatar>
                      <p className="text-sm text-muted-foreground text-center">No verification photos available yet</p>
                      <p className="text-xs text-muted-foreground text-center mt-2">
                        Photos will appear here after the employee checks in with camera verification
                      </p>
                    </div>
                  )
                })()}
              </CardContent>
            </Card>

            {selectedRecord && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Verification Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="bg-success/10 border border-success/20 rounded-lg p-3">
                    <p className="text-xs font-semibold text-success mb-1">✓ Check-in Verified</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(selectedRecord.checkInTime!), "MMM d, yyyy 'at' h:mm a")}
                    </p>
                  </div>

                  {selectedRecord.checkInLocation && (
                    <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
                      <p className="text-xs font-semibold text-primary mb-1">📍 Location Verified</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {selectedRecord.checkInLocation.address ||
                          `${selectedRecord.checkInLocation.latitude.toFixed(4)}, ${selectedRecord.checkInLocation.longitude.toFixed(4)}`}
                      </p>
                      {selectedRecord.checkInLocation.accuracy && (
                        <p className="text-xs text-muted-foreground mt-1">
                          GPS Accuracy: {selectedRecord.checkInLocation.accuracy}m
                        </p>
                      )}
                    </div>
                  )}

                  {selectedRecord.checkOutTime && (
                    <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
                      <p className="text-xs font-semibold text-primary mb-1">✓ Check-out Verified</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(selectedRecord.checkOutTime), "MMM d, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

export { EmployeeDetailModal }
