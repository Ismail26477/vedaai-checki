import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/lib/models/User"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Login request received")
    console.log("[v0] MONGODB_URI exists:", !!process.env.MONGODB_URI)

    await connectDB()
    console.log("[v0] MongoDB connected successfully")

    const body = await request.json()
    const { email, password } = body
    console.log("[v0] Login attempt for email:", email)

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: "Email and password are required",
        },
        { status: 400 },
      )
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() })

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid email or password",
        },
        { status: 401 },
      )
    }

    // Check password
    const isMatch = await user.comparePassword(password)

    if (!isMatch) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid email or password",
        },
        { status: 401 },
      )
    }

    // Return user data (password excluded by toJSON method)
    return NextResponse.json({
      success: true,
      user: user.toJSON(),
    })
  } catch (error: any) {
    console.error("[v0] Login error:", error.message)
    console.error("[v0] Error stack:", error.stack)

    let errorMessage = "Server error during login"

    if (error.message.includes("ENOTFOUND")) {
      errorMessage = "Cannot connect to MongoDB - DNS error"
    } else if (error.message.includes("MongoServerSelectionError")) {
      errorMessage = "Cannot connect to MongoDB cluster - check IP whitelist"
    } else if (error.message.includes("authentication failed")) {
      errorMessage = "MongoDB authentication failed - check credentials"
    } else if (error.message.includes("MONGODB_URI")) {
      errorMessage = "MongoDB URI not configured in environment variables"
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    )
  }
}
