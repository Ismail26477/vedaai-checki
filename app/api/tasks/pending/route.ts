import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import DailyTask from "@/lib/models/DailyTask"

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const tasks = await DailyTask.find({ approvalStatus: "pending" })
      .sort({ date: -1 })
      .populate("employeeId", "name email department")

    return NextResponse.json({ success: true, data: tasks })
  } catch (error: any) {
    console.error("[v0] Error fetching pending tasks:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch pending tasks", details: error.message },
      { status: 500 },
    )
  }
}
