import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import EditorSheet from "@/lib/models/EditorSheet"
import mongoose from "mongoose"

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ sheetId: string }> }) {
  try {
    await connectDB()

    const { sheetId } = await params
    const { searchParams } = new URL(request.url)
    const taskId = searchParams.get("taskId")

    if (!taskId || !mongoose.Types.ObjectId.isValid(sheetId) || !mongoose.Types.ObjectId.isValid(taskId)) {
      return NextResponse.json({ success: false, error: "Invalid ID format" }, { status: 400 })
    }

    const sheet = await EditorSheet.findById(new mongoose.Types.ObjectId(sheetId))

    if (!sheet) {
      return NextResponse.json({ success: false, error: "Sheet not found" }, { status: 404 })
    }

    sheet.tasks = sheet.tasks.filter((t: any) => t._id.toString() !== taskId)
    await sheet.save()

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[v0] Delete task from sheet error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to delete task", details: error.message },
      { status: 500 },
    )
  }
}
