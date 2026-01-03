import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import DailyTask from "@/lib/models/DailyTask"

export async function PUT(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const { taskId, ...updateData } = body

    if (!taskId) {
      return NextResponse.json({ error: "Task ID is required" }, { status: 400 })
    }

    const updatedTask = await DailyTask.findByIdAndUpdate(taskId, updateData, { new: true })

    if (!updatedTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    return NextResponse.json(updatedTask)
  } catch (error: any) {
    console.error("[v0] Error updating task:", error)
    return NextResponse.json({ error: error.message || "Failed to update task" }, { status: 500 })
  }
}
