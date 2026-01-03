import mongoose from "mongoose"

const dailyTaskSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    project: {
      type: String,
      required: true,
      trim: true,
    },
    workingTime: {
      type: Number,
      required: true,
      min: 0,
      max: 24,
    },
    taskDone: {
      type: String,
      required: true,
      trim: true,
    },
    researchDone: {
      type: String,
      default: "",
      trim: true,
    },
    remarks: {
      timeTaken: {
        type: Number,
        required: true,
        min: 0,
        max: 24,
      },
      timeExpected: {
        type: Number,
        required: true,
        min: 0,
        max: 24,
      },
      reason: {
        type: String,
        required: true,
        trim: true,
      },
    },
    managerRemarks: {
      type: String,
      default: "",
      trim: true,
    },
    managerComplains: {
      type: String,
      default: "",
      trim: true,
    },
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    approvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
)

// Index for finding tasks by employee and date
dailyTaskSchema.index({ employeeId: 1, date: -1 })
dailyTaskSchema.index({ approvalStatus: 1, date: -1 })

export default mongoose.models.DailyTask || mongoose.model("DailyTask", dailyTaskSchema)
