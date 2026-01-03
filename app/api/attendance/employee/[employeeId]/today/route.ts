import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import AttendanceRecord from "@/lib/models/AttendanceRecord"
import { format } from "date-fns"

export async function GET(request: NextRequest, { params }: { params: Promise<{ employeeId: string }> }) {
  try {
    await connectDB()

    const { employeeId } = await params
    const today = format(new Date(), "yyyy-MM-dd")

    const record = await AttendanceRecord.findOne({ employeeId, date: today })

    return NextResponse.json({ success: true, record })
  } catch (error: any) {
    console.error("[v0] Get today record error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch today's record", details: error.message },
      { status: 500 },
    )
  }
}
