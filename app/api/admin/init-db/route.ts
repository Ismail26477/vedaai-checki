import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/lib/models/User"
import bcrypt from "bcryptjs"

export async function POST() {
  try {
    await connectDB()

    await User.deleteMany({})

    const adminPassword = await bcrypt.hash("admin123", 10)
    const johnPassword = await bcrypt.hash("john123", 10)
    const sarahPassword = await bcrypt.hash("sarah123", 10)

    const users = await User.insertMany([
      {
        name: "Admin User",
        email: "admin@company.com",
        password: adminPassword,
        role: "admin",
        department: "Management",
        position: "System Administrator",
      },
      {
        name: "John Smith",
        email: "john@company.com",
        password: johnPassword,
        role: "employee",
        department: "Engineering",
        position: "Software Developer",
      },
      {
        name: "Sarah Johnson",
        email: "sarah@company.com",
        password: sarahPassword,
        role: "employee",
        department: "Design",
        position: "UI/UX Designer",
      },
    ])

    return NextResponse.json({
      success: true,
      message: "Database initialized successfully",
      users: users.map((u) => ({
        name: u.name,
        email: u.email,
        role: u.role,
      })),
    })
  } catch (error: any) {
    console.error("[v0] Init DB error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to initialize database",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
