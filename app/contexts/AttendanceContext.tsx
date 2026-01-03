"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { AttendanceRecord, Location } from "@/types/attendance"
import { format } from "date-fns"
import { attendanceApi } from "@/app/lib/api"

interface AttendanceContextType {
  records: AttendanceRecord[]
  todayRecord: AttendanceRecord | null
  checkIn: (
    employeeId: string,
    employeeName: string,
    location: Location,
    photoData?: string,
  ) => Promise<AttendanceRecord>
  checkOut: (recordId: string, location: Location, photoData?: string) => Promise<AttendanceRecord>
  getEmployeeRecords: (employeeId: string) => Promise<AttendanceRecord[]>
  getTodayRecords: () => Promise<AttendanceRecord[]>
  getRecordsByDate: (date: string) => Promise<AttendanceRecord[]>
  getTodayRecordForEmployee: (employeeId: string) => AttendanceRecord | null
}

const AttendanceContext = createContext<AttendanceContextType | undefined>(undefined)

export function AttendanceProvider({ children }: { children: ReactNode }) {
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const getTodayRecordForEmployee = (employeeId: string): AttendanceRecord | null => {
    const today = format(new Date(), "yyyy-MM-dd")
    return records.find((r) => r.employeeId === employeeId && r.date === today) || null
  }

  const checkIn = async (
    employeeId: string,
    employeeName: string,
    location: Location,
    photoData?: string,
  ): Promise<AttendanceRecord> => {
    try {
      console.log("[v0] AttendanceContext - checkIn called")
      console.log("[v0] AttendanceContext - PhotoData received:", photoData ? `${photoData.length} chars` : "no photo")
      console.log("[v0] AttendanceContext - PhotoData preview:", photoData?.substring(0, 50))

      const response = await attendanceApi.checkIn({
        employeeId,
        employeeName,
        location,
        deviceInfo: {
          browser: navigator.userAgent.split(" ").pop() || "Unknown",
          userAgent: navigator.userAgent,
        },
        photoData,
      })

      console.log("[v0] AttendanceContext - API response received")
      console.log("[v0] AttendanceContext - Response success:", response.success)

      if (response.success && response.record) {
        const newRecord: AttendanceRecord = {
          ...response.record,
          id: response.record._id || response.record.id,
          checkInTime: new Date(response.record.checkInTime),
          checkOutTime: response.record.checkOutTime ? new Date(response.record.checkOutTime) : null,
          photoData: response.record.photoData,
        }
        console.log("[v0] AttendanceContext - Check-in successful, photo saved to record:", !!newRecord.photoData)
        if (newRecord.photoData) {
          console.log("[v0] AttendanceContext - Saved photoData length:", newRecord.photoData.length)
        }
        setRecords((prev) => [...prev, newRecord])
        return newRecord
      }

      throw new Error(response.error || "Failed to check in")
    } catch (error) {
      console.error("[v0] AttendanceContext - Check-in error:", error)
      throw error
    }
  }

  const checkOut = async (recordId: string, location: Location, photoData?: string): Promise<AttendanceRecord> => {
    try {
      console.log("[v0] AttendanceContext - checkOut called")
      console.log(
        "[v0] AttendanceContext - CheckOut PhotoData received:",
        photoData ? `${photoData.length} chars` : "no photo",
      )
      console.log("[v0] AttendanceContext - CheckOut PhotoData preview:", photoData?.substring(0, 50))

      const response = await attendanceApi.checkOut(recordId, location, photoData)

      console.log("[v0] AttendanceContext - CheckOut API response received")
      console.log("[v0] AttendanceContext - Response success:", response.success)

      if (response.success && response.record) {
        const updatedRecord: AttendanceRecord = {
          ...response.record,
          id: response.record._id || response.record.id,
          checkInTime: new Date(response.record.checkInTime),
          checkOutTime: response.record.checkOutTime ? new Date(response.record.checkOutTime) : null,
          photoData: response.record.photoData,
          checkOutPhotoData: response.record.checkOutPhotoData,
        }
        console.log(
          "[v0] AttendanceContext - Check-out successful, checkOutPhoto saved to record:",
          !!updatedRecord.checkOutPhotoData,
        )
        if (updatedRecord.checkOutPhotoData) {
          console.log(
            "[v0] AttendanceContext - Saved checkOutPhotoData length:",
            updatedRecord.checkOutPhotoData.length,
          )
        }
        setRecords((prev) => prev.map((r) => (r.id === recordId ? updatedRecord : r)))
        return updatedRecord
      }

      throw new Error(response.error || "Failed to check out")
    } catch (error) {
      console.error("[v0] AttendanceContext - Check-out error:", error)
      throw error
    }
  }

  const getEmployeeRecords = async (employeeId: string): Promise<AttendanceRecord[]> => {
    try {
      console.log("[v0] Fetching records for employeeId:", employeeId)

      if (!employeeId || employeeId === "undefined") {
        console.error("[v0] Invalid employeeId provided:", employeeId)
        return []
      }

      const response = await attendanceApi.getEmployeeRecords(employeeId)
      if (response.success && response.records) {
        const mappedRecords = response.records.map((r: any) => ({
          ...r,
          id: r._id || r.id,
          checkInTime: r.checkInTime ? new Date(r.checkInTime) : null,
          checkOutTime: r.checkOutTime ? new Date(r.checkOutTime) : null,
          photoData: r.photoData || null,
          checkOutPhotoData: r.checkOutPhotoData || null,
        }))
        console.log("[v0] Mapped records with checkin photos:", mappedRecords.filter((r: any) => r.photoData).length)
        console.log(
          "[v0] Mapped records with checkout photos:",
          mappedRecords.filter((r: any) => r.checkOutPhotoData).length,
        )
        mappedRecords.forEach((r: any) => {
          if (r.checkOutPhotoData) {
            console.log("[v0] Record with checkout photo found:", r.id, "Photo length:", r.checkOutPhotoData.length)
          } else if (r.checkOutTime) {
            console.log("[v0] Record with checkout time but NO checkout photo:", r.id, "Checkout time:", r.checkOutTime)
          }
        })
        return mappedRecords
      }
      return []
    } catch (error) {
      console.error("[v0] Get employee records error:", error)
      return []
    }
  }

  const getTodayRecords = async (): Promise<AttendanceRecord[]> => {
    try {
      const response = await attendanceApi.getTodayRecords()
      if (response.success && response.records) {
        const todayRecords = response.records.map((r: any) => ({
          ...r,
          id: r._id || r.id,
          checkInTime: r.checkInTime ? new Date(r.checkInTime) : null,
          checkOutTime: r.checkOutTime ? new Date(r.checkOutTime) : null,
          photoData: r.photoData,
          checkOutPhotoData: r.checkOutPhotoData,
        }))
        setRecords(todayRecords)
        return todayRecords
      }
      return []
    } catch (error) {
      console.error("[v0] Get today records error:", error)
      return []
    }
  }

  const getRecordsByDate = async (date: string): Promise<AttendanceRecord[]> => {
    try {
      const response = await attendanceApi.getRecordsByDate(date)
      if (response.success && response.records) {
        return response.records.map((r: any) => ({
          ...r,
          id: r._id || r.id,
          checkInTime: r.checkInTime ? new Date(r.checkInTime) : null,
          checkOutTime: r.checkOutTime ? new Date(r.checkOutTime) : null,
          photoData: r.photoData,
          checkOutPhotoData: r.checkOutPhotoData,
        }))
      }
      return []
    } catch (error) {
      console.error("[v0] Get records by date error:", error)
      return []
    }
  }

  useEffect(() => {
    const fetchTodayRecords = async () => {
      setIsLoading(true)
      try {
        const todayRecords = await getTodayRecords()
        setRecords(todayRecords)
      } catch (error) {
        console.error("[v0] Error fetching today records:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTodayRecords()
  }, [])

  return (
    <AttendanceContext.Provider
      value={{
        records,
        todayRecord: null,
        checkIn,
        checkOut,
        getEmployeeRecords,
        getTodayRecords,
        getRecordsByDate,
        getTodayRecordForEmployee,
      }}
    >
      {children}
    </AttendanceContext.Provider>
  )
}

export function useAttendance() {
  const context = useContext(AttendanceContext)
  if (context === undefined) {
    throw new Error("useAttendance must be used within an AttendanceProvider")
  }
  return context
}
