import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import DailyTask from "@/lib/models/DailyTask"
import "@/lib/models/User"

export async function GET(request: NextRequest, { params }: { params: Promise<{ employeeId: string }> }) {
  try {
    await connectDB()
    const { employeeId } = await params

    const { searchParams } = new URL(request.url)
    const month = searchParams.get("month")
    const year = searchParams.get("year")

    const query: any = { employeeId }

    if (month && year) {
      const startDate = new Date(Number(year), Number(month) - 1, 1)
      const endDate = new Date(Number(year), Number(month), 0)
      query.date = { $gte: startDate, $lte: endDate }
    }

    const tasks = await DailyTask.find(query).sort({ date: -1 }).populate("employeeId", "name email")

    console.log("[v0] Employee tasks - employeeId:", employeeId, "found:", tasks.length)

    return NextResponse.json({ success: true, data: tasks })
  } catch (error: any) {
    console.error("[v0] Error fetching tasks:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch tasks", details: error.message },
      { status: 500 },
    )
  }
}
