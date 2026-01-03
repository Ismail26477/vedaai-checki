import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import AttendanceRecord from "@/lib/models/AttendanceRecord"

export async function GET(request: NextRequest, { params }: { params: Promise<{ employeeId: string }> }) {
  try {
    await connectDB()

    const { employeeId } = await params

    const records = await AttendanceRecord.find({ employeeId }).sort({ date: -1 }).limit(100)

    console.log("[v0] Employee attendance records - employeeId:", employeeId, "found:", records.length)
    console.log("[v0] Records with checkout photos:", records.filter((r: any) => r.checkOutPhotoData).length)

    records.forEach((r: any) => {
      if (r.checkOutPhotoData) {
        console.log("[v0] Record has checkout photo:", r._id, "Photo size:", r.checkOutPhotoData.length)
      }
    })

    return NextResponse.json({ success: true, records, data: records })
  } catch (error: any) {
    console.error("[v0] Get employee records error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch records", details: error.message },
      { status: 500 },
    )
  }
}
