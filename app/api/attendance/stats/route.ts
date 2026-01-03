import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import AttendanceRecord from "@/lib/models/AttendanceRecord"
import { format } from "date-fns"

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const today = format(new Date(), "yyyy-MM-dd")

    const todayRecords = await AttendanceRecord.find({ date: today })

    const stats = {
      presentToday: todayRecords.filter((r) => r.status === "checked-in" || r.status === "checked-out").length,
      checkedOut: todayRecords.filter((r) => r.status === "checked-out").length,
      avgWorkHours:
        todayRecords.filter((r) => r.totalHours !== null).reduce((acc, r) => acc + (r.totalHours || 0), 0) /
        (todayRecords.filter((r) => r.totalHours !== null).length || 1),
    }

    return NextResponse.json({ success: true, stats })
  } catch (error: any) {
    console.error("[v0] Get stats error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch stats", details: error.message },
      { status: 500 },
    )
  }
}
