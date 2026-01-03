import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import EditorSheet from "@/lib/models/EditorSheet"

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const { employeeId, employeeName, sheetName, description, category, dueDate } = body

    if (!employeeId || !sheetName) {
      return NextResponse.json({ success: false, error: "Employee ID and sheet name are required" }, { status: 400 })
    }

    const sheet = new EditorSheet({
      employeeId,
      employeeName,
      sheetName,
      description: description || "",
      category: category || "",
      dueDate: dueDate ? new Date(dueDate) : null,
      tasks: [],
    })

    await sheet.save()

    return NextResponse.json({ success: true, sheet }, { status: 201 })
  } catch (error: any) {
    console.error("[v0] Create sheet error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create sheet", details: error.message },
      { status: 500 },
    )
  }
}
