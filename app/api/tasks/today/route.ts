import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import DailyTask from "@/lib/models/DailyTask"

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get("employeeId")

    if (!employeeId) {
      return NextResponse.json({ error: "Employee ID is required" }, { status: 400 })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const task = await DailyTask.findOne({
      employeeId,
      date: { $gte: today, $lt: tomorrow },
    })

    return NextResponse.json(task || null)
  } catch (error: any) {
    console.error("[v0] Error fetching today's task:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch today's task" }, { status: 500 })
  }
}
