import express from "express"
import DailyTask from "../models/DailyTask.js"
import mongoose from "mongoose"

const router = express.Router()

// Get tasks for an employee
router.get("/employee/:employeeId", async (req, res) => {
  try {
    const { employeeId } = req.params

    if (!employeeId || employeeId === "undefined" || !mongoose.Types.ObjectId.isValid(employeeId)) {
      return res.status(400).json({ error: "Invalid employee ID" })
    }

    const tasks = await DailyTask.find({ employeeId }).sort({ date: -1 }).populate("employeeId", "name email")

    res.json(tasks)
  } catch (error) {
    console.error("[v0] Get employee tasks error:", error)
    res.status(500).json({ error: "Failed to fetch tasks" })
  }
})

// Get pending tasks (for admin/manager)
router.get("/pending", async (req, res) => {
  try {
    const tasks = await DailyTask.find({ approvalStatus: "pending" })
      .sort({ date: -1 })
      .populate("employeeId", "name email department")

    res.json(tasks)
  } catch (error) {
    console.error("[v0] Get pending tasks error:", error)
    res.status(500).json({ error: "Failed to fetch pending tasks" })
  }
})

// Get all tasks (for admin)
router.get("/all", async (req, res) => {
  try {
    const tasks = await DailyTask.find({}).sort({ date: -1 }).populate("employeeId", "name email department")

    res.json(tasks)
  } catch (error) {
    console.error("[v0] Get all tasks error:", error)
    res.status(500).json({ error: "Failed to fetch all tasks" })
  }
})

// Create a task
router.post("/create", async (req, res) => {
  try {
    const { employeeId, date, project, workingTime, taskDone, researchDone, remarks } = req.body

    if (!employeeId || !date || !project || !taskDone || !remarks) {
      return res.status(400).json({ error: "Missing required fields" })
    }

    const newTask = new DailyTask({
      employeeId,
      date: new Date(date),
      project,
      workingTime,
      taskDone,
      researchDone: researchDone || "",
      remarks,
    })

    await newTask.save()
    res.status(201).json(newTask)
  } catch (error) {
    console.error("[v0] Create task error:", error)
    res.status(500).json({ error: "Failed to create task" })
  }
})

// Approve/Reject task
router.put("/approve", async (req, res) => {
  try {
    const { taskId, approvalStatus, approverId, remarks, complains } = req.body

    if (!taskId || !approvalStatus || !approverId) {
      return res.status(400).json({ error: "Missing required fields" })
    }

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({ error: "Invalid task ID format" })
    }

    const updateData = {
      approvalStatus,
      approvedAt: new Date(),
      managerRemarks: remarks || "",
      managerComplains: complains || "",
    }

    if (mongoose.Types.ObjectId.isValid(approverId)) {
      updateData.approvedBy = approverId
    }

    const updatedTask = await DailyTask.findByIdAndUpdate(taskId, updateData, { new: true })

    if (!updatedTask) {
      return res.status(404).json({ error: "Task not found" })
    }

    res.json(updatedTask)
  } catch (error) {
    console.error("[v0] Approve task error:", error)
    res.status(500).json({ error: "Failed to update task" })
  }
})

export default router
