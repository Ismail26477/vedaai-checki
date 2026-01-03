import express from "express"
import EditorSheet from "../models/EditorSheet.js"
import mongoose from "mongoose"

const router = express.Router()

// Get all sheets for an employee
router.get("/employee/:employeeId", async (req, res) => {
  try {
    const { employeeId } = req.params
    console.log("[v0] Fetching sheets for employee:", employeeId)

    let sheets = []
    sheets = await EditorSheet.find({
      $or: [
        { employeeId: employeeId }, // String match
        { employeeId: mongoose.Types.ObjectId.isValid(employeeId) ? mongoose.Types.ObjectId(employeeId) : null }, // ObjectId match if valid
      ],
    }).sort({ createdAt: -1 })

    console.log("[v0] Found sheets:", sheets.length, "for employeeId:", employeeId)
    if (sheets.length === 0) {
      console.log("[v0] No sheets found. Checking all sheets in DB:")
      const allSheets = await EditorSheet.find({})
      console.log("[v0] Total sheets in DB:", allSheets.length)
      allSheets.forEach((s) =>
        console.log("[v0] Sheet:", s._id, "employeeId:", s.employeeId, "type:", typeof s.employeeId),
      )
    }
    res.json({ success: true, sheets })
  } catch (error) {
    console.error("[v0] Error fetching sheets:", error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// Create a new sheet
router.post("/create", async (req, res) => {
  try {
    const { employeeId, employeeName, sheetName, description, category, dueDate } = req.body

    console.log("[v0] Creating sheet with:", { employeeId, employeeName, sheetName })

    if (!employeeId || !employeeName || !sheetName) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: employeeId, employeeName, or sheetName",
      })
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
    console.log("[v0] Sheet created successfully:", sheet._id, "for employeeId:", employeeId)
    res.status(201).json({ success: true, sheet })
  } catch (error) {
    console.error("[v0] Error creating sheet:", error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// Add a task to a sheet
router.post("/:sheetId/add-task", async (req, res) => {
  try {
    const { sheetId } = req.params
    const { date, title, link } = req.body

    const sheet = await EditorSheet.findById(sheetId)
    if (!sheet) {
      return res.status(404).json({ success: false, error: "Sheet not found" })
    }

    sheet.tasks.push({ date, title, link })
    await sheet.save()

    res.status(201).json({ success: true, task: sheet.tasks[sheet.tasks.length - 1] })
  } catch (error) {
    console.error("[v0] Error adding task:", error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// Update a task in a sheet
router.put("/:sheetId/update-task", async (req, res) => {
  try {
    const { sheetId } = req.params
    const { taskId, date, title, link } = req.body

    const sheet = await EditorSheet.findById(sheetId)
    if (!sheet) {
      return res.status(404).json({ success: false, error: "Sheet not found" })
    }

    const task = sheet.tasks.id(taskId)
    if (!task) {
      return res.status(404).json({ success: false, error: "Task not found" })
    }

    if (date) task.date = date
    if (title) task.title = title
    if (link) task.link = link

    await sheet.save()
    res.json({ success: true, task })
  } catch (error) {
    console.error("[v0] Error updating task:", error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// Delete a task from a sheet
router.delete("/:sheetId/delete-task", async (req, res) => {
  try {
    const { sheetId } = req.params
    const { taskId } = req.query

    const sheet = await EditorSheet.findById(sheetId)
    if (!sheet) {
      return res.status(404).json({ success: false, error: "Sheet not found" })
    }

    sheet.tasks.pull({ _id: taskId })
    await sheet.save()

    res.json({ success: true, message: "Task deleted successfully" })
  } catch (error) {
    console.error("[v0] Error deleting task:", error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// Admin: Get all sheets
router.get("/all", async (req, res) => {
  try {
    const sheets = await EditorSheet.find({}).sort({ updatedAt: -1 })
    res.json({ success: true, sheets })
  } catch (error) {
    console.error("[v0] Error fetching all sheets:", error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// Delete individual sheet
router.delete("/:sheetId", async (req, res) => {
  try {
    const { sheetId } = req.params

    const sheet = await EditorSheet.findByIdAndDelete(sheetId)
    if (!sheet) {
      return res.status(404).json({ success: false, error: "Sheet not found" })
    }

    res.json({ success: true, message: "Sheet deleted successfully" })
  } catch (error) {
    console.error("[v0] Error deleting sheet:", error)
    res.status(500).json({ success: false, error: error.message })
  }
})

export default router
