import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import EditorSheet from "@/lib/models/EditorSheet"
import mongoose from "mongoose"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ sheetId: string }> }) {
  try {
    await connectDB()

    const { sheetId } = await params
    const body = await request.json()
    const { taskId, date, title, link } = body

    if (!mongoose.Types.ObjectId.isValid(sheetId) || !mongoose.Types.ObjectId.isValid(taskId)) {
      return NextResponse.json({ success: false, error: "Invalid ID" }, { status: 400 })
    }

    const sheet = await EditorSheet.findById(sheetId)

    if (!sheet) {
      return NextResponse.json({ success: false, error: "Sheet not found" }, { status: 404 })
    }

    const taskIndex = sheet.tasks.findIndex((t: any) => t._id.toString() === taskId)

    if (taskIndex === -1) {
      return NextResponse.json({ success: false, error: "Task not found" }, { status: 404 })
    }

    if (date) sheet.tasks[taskIndex].date = date
    if (title) sheet.tasks[taskIndex].title = title
    if (link !== undefined) sheet.tasks[taskIndex].link = link

    await sheet.save()

    return NextResponse.json({ success: true, data: sheet })
  } catch (error: any) {
    console.error("[v0] Update task in sheet error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update task", details: error.message },
      { status: 500 },
    )
  }
}
