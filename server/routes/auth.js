import express from "express"
import User from "../models/User.js"

const router = express.Router()

// Login endpoint
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email and password are required",
      })
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() })

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password",
      })
    }

    // Check password
    const isMatch = await user.comparePassword(password)

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password",
      })
    }

    // Return user data (password excluded by toJSON method)
    res.json({
      success: true,
      user: user.toJSON(),
    })
  } catch (error) {
    console.error("[v0] Login error:", error)
    res.status(500).json({
      success: false,
      error: "Server error during login",
    })
  }
})

// Register endpoint (for creating new users)
router.post("/register", async (req, res) => {
  try {
    const { email, password, name, role, department } = req.body

    // Validate input
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        error: "Email, password, and name are required",
      })
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() })

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: "User with this email already exists",
      })
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

    res.status(201).json({
      success: true,
      user: user.toJSON(),
      message: "User created successfully",
    })
  } catch (error) {
    console.error("[v0] Registration error:", error)
    res.status(500).json({
      success: false,
      error: "Server error during registration",
    })
  }
})

export default router
