import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/lib/models/User"

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const count = await User.countDocuments()

    return NextResponse.json({ success: true, count })
  } catch (error: any) {
    console.error("[v0] Get user count error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch user count", details: error.message },
      { status: 500 },
    )
  }
}
