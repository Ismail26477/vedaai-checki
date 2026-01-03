import mongoose from "mongoose"

interface ILocation {
  latitude: number
  longitude: number
  address?: string
  accuracy?: number
}

interface IDeviceInfo {
  ip?: string
  browser?: string
  userAgent?: string
}

export interface IAttendanceRecord extends mongoose.Document {
  employeeId: mongoose.Types.ObjectId
  employeeName: string
  date: string
  checkInTime?: Date
  checkInLocation?: ILocation
  checkOutTime?: Date
  checkOutLocation?: ILocation
  totalHours?: number
  status: "checked-in" | "checked-out" | "absent"
  deviceInfo?: IDeviceInfo
  photoData?: string
  checkOutPhotoData?: string
  createdAt: Date
  updatedAt: Date
}

const locationSchema = new mongoose.Schema<ILocation>(
  {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    address: { type: String },
    accuracy: { type: Number },
  },
  { _id: false },
)

const deviceInfoSchema = new mongoose.Schema<IDeviceInfo>(
  {
    ip: { type: String },
    browser: { type: String },
    userAgent: { type: String },
  },
  { _id: false },
)

const attendanceRecordSchema = new mongoose.Schema<IAttendanceRecord>(
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

export default mongoose.models.AttendanceRecord ||
  mongoose.model<IAttendanceRecord>("AttendanceRecord", attendanceRecordSchema)
