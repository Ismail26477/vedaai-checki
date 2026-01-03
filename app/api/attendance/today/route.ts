import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import AttendanceRecord from "@/lib/models/AttendanceRecord"
import { format } from "date-fns"

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const today = format(new Date(), "yyyy-MM-dd")

    const records = await AttendanceRecord.find({ date: today }).sort({ checkInTime: -1 })

    console.log("[v0] Today attendance records - date:", today, "found:", records.length)

    return NextResponse.json({ success: true, records })
  } catch (error: any) {
    console.error("[v0] Get today records error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch today's records", details: error.message },
      { status: 500 },
    )
  }
}
