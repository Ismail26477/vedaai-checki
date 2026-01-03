import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import EditorSheet from "@/lib/models/EditorSheet"

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const sheets = await EditorSheet.find({}).sort({ createdAt: -1 })

    return NextResponse.json({ success: true, data: sheets })
  } catch (error: any) {
    console.error("[v0] Get all sheets error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch sheets", details: error.message },
      { status: 500 },
    )
  }
}
