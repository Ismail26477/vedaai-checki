import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/lib/models/User"

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const users = await User.find({}).select("-password")

    return NextResponse.json({ success: true, users: users })
  } catch (error: any) {
    console.error("[v0] Get users error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch users", details: error.message },
      { status: 500 },
    )
  }
}
