import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import AttendanceRecord from "@/lib/models/AttendanceRecord"

export async function GET(request: NextRequest, { params }: { params: Promise<{ date: string }> }) {
  try {
    await connectDB()

    const { date } = await params

    const records = await AttendanceRecord.find({ date }).sort({ checkInTime: -1 })

    console.log("[v0] Attendance by date query - date:", date, "found:", records.length)

    return NextResponse.json({ success: true, records })
  } catch (error: any) {
    console.error("[v0] Get records by date error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch records", details: error.message },
      { status: 500 },
    )
  }
}
