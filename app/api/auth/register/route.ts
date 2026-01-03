import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/lib/models/User"

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const { email, password, name, role, department } = body

    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json(
        {
          success: false,
          error: "Email, password, and name are required",
        },
        { status: 400 },
      )
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() })

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: "User with this email already exists",
        },
        { status: 409 },
      )
    }

    // Create new user
    const user = new User({
      email: email.toLowerCase(),
      password,
      name,
      role: role || "employee",
      department,
    })

    await user.save()

    return NextResponse.json(
      {
        success: true,
        user: user.toJSON(),
        message: "User created successfully",
      },
      { status: 201 },
    )
  } catch (error: any) {
    console.error("[v0] Registration error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Server error during registration",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
