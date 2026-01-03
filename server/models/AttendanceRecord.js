import mongoose from "mongoose"

const locationSchema = new mongoose.Schema(
  {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    address: { type: String },
    accuracy: { type: Number },
  },
  { _id: false },
)

const deviceInfoSchema = new mongoose.Schema(
  {
    ip: { type: String },
    browser: { type: String },
    userAgent: { type: String },
  },
  { _id: false },
)

const attendanceRecordSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    employeeName: {
      type: String,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    checkInTime: {
      type: Date,
      default: null,
    },
    checkInLocation: {
      type: locationSchema,
      default: null,
    },
    checkOutTime: {
      type: Date,
      default: null,
    },
    checkOutLocation: {
      type: locationSchema,
      default: null,
    },
    totalHours: {
      type: Number,
      default: null,
    },
    status: {
      type: String,
      enum: ["checked-in", "checked-out", "absent"],
      default: "absent",
    },
    deviceInfo: {
      type: deviceInfoSchema,
      default: null,
    },
    photoData: {
      type: String,
      default: null,
    },
    checkOutPhotoData: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
)

// Index for faster queries
attendanceRecordSchema.index({ employeeId: 1, date: 1 })
attendanceRecordSchema.index({ date: 1 })

export default mongoose.model("AttendanceRecord", attendanceRecordSchema)
