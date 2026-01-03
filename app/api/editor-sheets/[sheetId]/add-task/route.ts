import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import EditorSheet from "@/lib/models/EditorSheet"
import mongoose from "mongoose"

export async function POST(request: NextRequest, { params }: { params: Promise<{ sheetId: string }> }) {
  try {
    await connectDB()

    const { sheetId } = await params
    const body = await request.json()
    const { date, title, link } = body

    if (!mongoose.Types.ObjectId.isValid(sheetId)) {
      return NextResponse.json({ success: false, error: "Invalid sheet ID" }, { status: 400 })
    }

    if (!date || !title) {
      return NextResponse.json({ success: false, error: "Date and title are required" }, { status: 400 })
    }

    const sheet = await EditorSheet.findById(new mongoose.Types.ObjectId(sheetId))

    if (!sheet) {
      return NextResponse.json({ success: false, error: "Sheet not found" }, { status: 404 })
    }

    const task = {
      _id: new mongoose.Types.ObjectId(),
      date,
      title,
      link: link || "",
    }

    sheet.tasks.push(task)
    await sheet.save()

    return NextResponse.json(
      {
        success: true,
        task: {
          _id: task._id.toString(),
          date: task.date,
          title: task.title,
          link: task.link,
        },
      },
      { status: 201 },
    )
  } catch (error: any) {
    console.error("[v0] Add task to sheet error:", error)
    return NextResponse.json({ success: false, error: "Failed to add task", details: error.message }, { status: 500 })
  }
}
