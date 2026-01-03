import express from "express"
import User from "../models/User.js"

const router = express.Router()

// Get all users
router.get("/", async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 })
    res.json({ success: true, users })
  } catch (error) {
    console.error("[v0] Get users error:", error)
    res.status(500).json({ success: false, error: "Failed to fetch users" })
  }
})

// Get user by ID
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params
    const user = await User.findById(userId)

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" })
    }

    res.json({ success: true, user })
  } catch (error) {
    console.error("[v0] Get user error:", error)
    res.status(500).json({ success: false, error: "Failed to fetch user" })
  }
})

// Update user
router.put("/:userId", async (req, res) => {
  try {
    const { userId } = req.params
    const updates = req.body

    // Don't allow password updates through this endpoint
    delete updates.password

    const user = await User.findByIdAndUpdate(userId, updates, { new: true, runValidators: true })

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" })
    }

    res.json({ success: true, user })
  } catch (error) {
    console.error("[v0] Update user error:", error)
    res.status(500).json({ success: false, error: "Failed to update user" })
  }
})

// Delete user
router.delete("/:userId", async (req, res) => {
  try {
    const { userId } = req.params

    const user = await User.findByIdAndDelete(userId)

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" })
    }

    res.json({ success: true, message: "User deleted successfully" })
  } catch (error) {
    console.error("[v0] Delete user error:", error)
    res.status(500).json({ success: false, error: "Failed to delete user" })
  }
})

export default router
