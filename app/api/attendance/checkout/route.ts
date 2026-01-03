import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import AttendanceRecord from "@/lib/models/AttendanceRecord"

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const { recordId, location, photoData } = body

    console.log("[v0] Checkout API - photoData received:", photoData ? `${photoData.substring(0, 50)}...` : "NO PHOTO")
    console.log("[v0] Checkout API - photoData length:", photoData?.length || 0)

    if (!recordId) {
      return NextResponse.json(
        {
          success: false,
          error: "Record ID is required",
        },
        { status: 400 },
      )
    }

    const record = await AttendanceRecord.findById(recordId)

    if (!record) {
      return NextResponse.json(
        {
          success: false,
          error: "Record not found",
        },
        { status: 404 },
      )
    }

    if (record.status === "checked-out") {
      return NextResponse.json(
        {
          success: false,
          error: "Already checked out",
        },
        { status: 400 },
      )
    }

    const checkOutTime = new Date()
    const checkInTime = record.checkInTime
    const totalHours = checkInTime ? (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60) : 0

    const updateData: any = {
      checkOutTime,
      checkOutLocation: {
        latitude: location?.latitude || 0,
        longitude: location?.longitude || 0,
        address: location?.address || "Location not available",
        accuracy: location?.accuracy || null,
      },
      totalHours: Math.round(totalHours * 100) / 100,
      status: "checked-out",
    }

    if (photoData) {
      console.log("[v0] Checkout API - Adding checkOutPhotoData, length:", photoData.length)
      updateData.checkOutPhotoData = photoData
    } else {
      console.log("[v0] Checkout API - WARNING: No photoData provided!")
    }

    const savedRecord = await AttendanceRecord.findByIdAndUpdate(recordId, updateData, {
      new: true,
      runValidators: true,
    })

    console.log("[v0] Checkout API - Record updated via findByIdAndUpdate")
    console.log("[v0] Checkout API - checkOutPhotoData in updated record:", !!savedRecord?.checkOutPhotoData)
    if (savedRecord?.checkOutPhotoData) {
      console.log("[v0] Checkout API - Saved checkOutPhotoData length:", savedRecord.checkOutPhotoData.length)
    }

    return NextResponse.json({
      success: true,
      record: {
        _id: savedRecord?._id,
        id: savedRecord?._id,
        employeeId: savedRecord?.employeeId,
        employeeName: savedRecord?.employeeName,
        date: savedRecord?.date,
        checkInTime: savedRecord?.checkInTime,
        checkInLocation: savedRecord?.checkInLocation,
        checkOutTime: savedRecord?.checkOutTime,
        checkOutLocation: savedRecord?.checkOutLocation,
        photoData: savedRecord?.photoData,
        checkOutPhotoData: savedRecord?.checkOutPhotoData,
        totalHours: savedRecord?.totalHours,
        status: savedRecord?.status,
        deviceInfo: savedRecord?.deviceInfo,
      },
    })
  } catch (error: any) {
    console.error("[v0] Check-out error:", error)
    return NextResponse.json({ success: false, error: "Failed to check out", details: error.message }, { status: 500 })
  }
}
