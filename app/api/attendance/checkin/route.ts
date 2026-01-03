import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import AttendanceRecord from "@/lib/models/AttendanceRecord"
import { format } from "date-fns"

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const { employeeId, employeeName, location, deviceInfo, photoData } = body

    console.log("[v0] Next.js API - Check-in request received")
    console.log("[v0] Next.js API - Employee ID:", employeeId)
    console.log("[v0] Next.js API - Employee Name:", employeeName)
    console.log("[v0] Next.js API - Has photoData:", !!photoData)

    if (photoData) {
      console.log("[v0] Next.js API - PhotoData length:", photoData.length)
      console.log("[v0] Next.js API - PhotoData type:", typeof photoData)
      console.log("[v0] Next.js API - PhotoData preview:", photoData.substring(0, 50))
    } else {
      console.log("[v0] Next.js API - ⚠️  PhotoData is missing")
    }

    if (!employeeId || !employeeName) {
      return NextResponse.json(
        {
          success: false,
          error: "Employee ID and name are required",
        },
        { status: 400 },
      )
    }

    const today = format(new Date(), "yyyy-MM-dd")

    // Check if already checked in today
    const existingRecord = await AttendanceRecord.findOne({ employeeId, date: today })

    if (existingRecord) {
      return NextResponse.json(
        {
          success: false,
          error: "Already checked in today",
        },
        { status: 400 },
      )
    }

    const record = new AttendanceRecord({
      employeeId,
      employeeName,
      date: today,
      checkInTime: new Date(),
      photoData: photoData || null,
      checkInLocation: {
        latitude: location?.latitude || 0,
        longitude: location?.longitude || 0,
        address: location?.address || "Location not available",
        accuracy: location?.accuracy || null,
      },
      status: "checked-in",
      deviceInfo: deviceInfo || {},
    })

    await record.save()

    console.log("[v0] Next.js API - ✅ Check-in successful")
    console.log("[v0] Next.js API - Record ID:", record._id)
    console.log("[v0] Next.js API - Photo saved to database:", !!record.photoData)

    if (record.photoData) {
      console.log("[v0] Next.js API - ✅ Saved photoData length:", record.photoData.length)
    } else {
      console.log("[v0] Next.js API - ⚠️  WARNING: PhotoData was NOT saved!")
    }

    return NextResponse.json(
      {
        success: true,
        record: {
          _id: record._id,
          id: record._id,
          employeeId: record.employeeId,
          employeeName: record.employeeName,
          date: record.date,
          checkInTime: record.checkInTime,
          checkInLocation: record.checkInLocation,
          checkOutTime: record.checkOutTime,
          checkOutLocation: record.checkOutLocation,
          totalHours: record.totalHours,
          status: record.status,
          deviceInfo: record.deviceInfo,
          photoData: record.photoData,
        },
      },
      { status: 201 },
    )
  } catch (error: any) {
    console.error("[v0] Next.js API - Check-in error:", error)
    return NextResponse.json({ success: false, error: "Failed to check in", details: error.message }, { status: 500 })
  }
}
