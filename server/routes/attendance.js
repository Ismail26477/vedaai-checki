import express from "express"
import AttendanceRecord from "../models/AttendanceRecord.js"
import { format } from "date-fns"
import mongoose from "mongoose"

const router = express.Router()

// Get all attendance records for a specific employee
router.get("/employee/:employeeId", async (req, res) => {
  try {
    const { employeeId } = req.params

    if (!employeeId || employeeId === "undefined" || !mongoose.Types.ObjectId.isValid(employeeId)) {
      return res.status(400).json({ success: false, error: "Invalid employee ID" })
    }

    const records = await AttendanceRecord.find({ employeeId }).sort({ date: -1 }).limit(100)

    res.json({ success: true, records })
  } catch (error) {
    console.error("[v0] Get employee records error:", error)
    res.status(500).json({ success: false, error: "Failed to fetch records" })
  }
})

// Get today's record for a specific employee
router.get("/employee/:employeeId/today", async (req, res) => {
  try {
    const { employeeId } = req.params
    const today = format(new Date(), "yyyy-MM-dd")

    const record = await AttendanceRecord.findOne({ employeeId, date: today })

    res.json({ success: true, record })
  } catch (error) {
    console.error("[v0] Get today record error:", error)
    res.status(500).json({ success: false, error: "Failed to fetch today's record" })
  }
})

// Get all attendance records for a specific date
router.get("/date/:date", async (req, res) => {
  try {
    const { date } = req.params

    const records = await AttendanceRecord.find({ date }).sort({ checkInTime: -1 })

    res.json({ success: true, records })
  } catch (error) {
    console.error("[v0] Get records by date error:", error)
    res.status(500).json({ success: false, error: "Failed to fetch records" })
  }
})

// Get today's all records
router.get("/today", async (req, res) => {
  try {
    const today = format(new Date(), "yyyy-MM-dd")

    const records = await AttendanceRecord.find({ date: today }).sort({ checkInTime: -1 })

    res.json({ success: true, records })
  } catch (error) {
    console.error("[v0] Get today records error:", error)
    res.status(500).json({ success: false, error: "Failed to fetch today's records" })
  }
})

// Check in
router.post("/checkin", async (req, res) => {
  try {
    const { employeeId, employeeName, location, deviceInfo, photoData } = req.body

    console.log("[v0] Check-in request received")
    console.log("[v0] Employee ID:", employeeId)
    console.log("[v0] Employee Name:", employeeName)
    console.log("[v0] Has photoData:", !!photoData)

    if (photoData) {
      console.log("[v0] PhotoData type:", typeof photoData)
      console.log("[v0] PhotoData length:", photoData.length)
      console.log("[v0] PhotoData preview:", photoData.substring(0, 50) + "...")
      console.log("[v0] PhotoData starts with 'data:image':", photoData.startsWith("data:image"))
    } else {
      console.log("[v0] ⚠️  PhotoData is missing or null")
    }

    if (!employeeId || !employeeName || !location) {
      return res.status(400).json({
        success: false,
        error: "Employee ID, name, and location are required",
      })
    }

    const today = format(new Date(), "yyyy-MM-dd")

    // Check if already checked in today
    const existingRecord = await AttendanceRecord.findOne({ employeeId, date: today })

    if (existingRecord) {
      return res.status(400).json({
        success: false,
        error: "Already checked in today",
      })
    }

    const record = new AttendanceRecord({
      employeeId,
      employeeName,
      date: today,
      checkInTime: new Date(),
      checkInLocation: location,
      status: "checked-in",
      deviceInfo,
      photoData, // Save photo data
    })

    await record.save()

    console.log("[v0] ✅ Check-in successful")
    console.log("[v0] Record ID:", record._id)
    console.log("[v0] Photo saved to database:", !!record.photoData)

    if (record.photoData) {
      console.log("[v0] ✅ Saved photoData length:", record.photoData.length)
      console.log("[v0] ✅ Saved photoData type:", typeof record.photoData)
    } else {
      console.log("[v0] ⚠️  WARNING: PhotoData was NOT saved to database!")
    }

    res.status(201).json({ success: true, record })
  } catch (error) {
    console.error("[v0] Check-in error:", error)
    res.status(500).json({ success: false, error: "Failed to check in" })
  }
})

// Check out
router.post("/checkout", async (req, res) => {
  try {
    const { recordId, location, photoData } = req.body

    console.log("[v0] Check-out request received")
    console.log("[v0] Record ID:", recordId)
    console.log("[v0] Has checkOutPhotoData:", !!photoData)

    if (photoData) {
      console.log("[v0] CheckOutPhotoData type:", typeof photoData)
      console.log("[v0] CheckOutPhotoData length:", photoData.length)
      console.log("[v0] CheckOutPhotoData preview:", photoData.substring(0, 50) + "...")
    } else {
      console.log("[v0] ⚠️  CheckOutPhotoData is missing or null")
    }

    if (!recordId || !location) {
      return res.status(400).json({
        success: false,
        error: "Record ID and location are required",
      })
    }

    const record = await AttendanceRecord.findById(recordId)

    if (!record) {
      return res.status(404).json({
        success: false,
        error: "Record not found",
      })
    }

    if (record.status === "checked-out") {
      return res.status(400).json({
        success: false,
        error: "Already checked out",
      })
    }

    const checkOutTime = new Date()
    const checkInTime = record.checkInTime
    const totalHours = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60)

    record.checkOutTime = checkOutTime
    record.checkOutLocation = location
    record.totalHours = Math.round(totalHours * 100) / 100
    record.status = "checked-out"
    if (photoData) {
      record.checkOutPhotoData = photoData
    }

    await record.save()

    console.log("[v0] ✅ Check-out successful")
    console.log("[v0] Record ID:", record._id)
    console.log("[v0] CheckOut photo saved to database:", !!record.checkOutPhotoData)

    if (record.checkOutPhotoData) {
      console.log("[v0] ✅ Saved checkOutPhotoData length:", record.checkOutPhotoData.length)
    } else {
      console.log("[v0] ⚠️  WARNING: CheckOutPhotoData was NOT saved to database!")
    }

    res.json({ success: true, record })
  } catch (error) {
    console.error("[v0] Check-out error:", error)
    res.status(500).json({ success: false, error: "Failed to check out" })
  }
})

// Get attendance stats
router.get("/stats", async (req, res) => {
  try {
    const today = format(new Date(), "yyyy-MM-dd")

    const todayRecords = await AttendanceRecord.find({ date: today })

    const stats = {
      presentToday: todayRecords.filter((r) => r.status === "checked-in" || r.status === "checked-out").length,
      checkedOut: todayRecords.filter((r) => r.status === "checked-out").length,
      avgWorkHours:
        todayRecords.filter((r) => r.totalHours !== null).reduce((acc, r) => acc + (r.totalHours || 0), 0) /
        (todayRecords.filter((r) => r.totalHours !== null).length || 1),
    }

    res.json({ success: true, stats })
  } catch (error) {
    console.error("[v0] Get stats error:", error)
    res.status(500).json({ success: false, error: "Failed to fetch stats" })
  }
})

export default router
