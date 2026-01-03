import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import EditorSheet from "@/lib/models/EditorSheet"
import mongoose from "mongoose"

export async function GET(request: NextRequest, { params }: { params: Promise<{ sheetId: string }> }) {
  try {
    await connectDB()

    const { sheetId } = await params

    console.log("[v0] Fetching sheet with ID:", sheetId)

    if (!mongoose.Types.ObjectId.isValid(sheetId)) {
      console.log("[v0] Invalid sheet ID format:", sheetId)
      return NextResponse.json({ success: false, error: "Invalid sheet ID" }, { status: 400 })
    }

    const sheet = await EditorSheet.findById(new mongoose.Types.ObjectId(sheetId))

    if (!sheet) {
      console.log("[v0] No sheet found for ID:", sheetId)
      return NextResponse.json({ success: false, error: "Sheet not found" }, { status: 404 })
    }

    console.log("[v0] Sheet found:", sheet._id)

    return NextResponse.json({
      success: true,
      sheet: {
        _id: sheet._id.toString(),
        sheetName: sheet.sheetName,
        description: sheet.description,
        category: sheet.category,
        dueDate: sheet.dueDate,
        tasks: sheet.tasks || [],
        employeeId: sheet.employeeId,
        employeeName: sheet.employeeName,
        isCompleted: sheet.isCompleted,
        createdAt: sheet.createdAt,
        updatedAt: sheet.updatedAt,
      },
    })
  } catch (error: any) {
    console.error("[v0] Error fetching sheet:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
