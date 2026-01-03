import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import DailyTask from "@/lib/models/DailyTask"

export async function PUT(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const { taskId, approvalStatus, approverId, remarks, complains } = body

    if (!taskId || !approvalStatus || !approverId) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    const updatedTask = await DailyTask.findByIdAndUpdate(
      taskId,
      {
        approvalStatus,
        approvedBy: approverId,
        approvedAt: new Date(),
        managerRemarks: remarks || "",
        managerComplains: complains || "",
      },
      { new: true },
    )

    if (!updatedTask) {
      return NextResponse.json({ success: false, error: "Task not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: updatedTask })
  } catch (error: any) {
    console.error("[v0] Error approving task:", error)
    return NextResponse.json(
      { success: false, error: "Failed to approve task", details: error.message },
      { status: 500 },
    )
  }
}
