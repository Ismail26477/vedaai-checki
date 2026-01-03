import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import dotenv from "dotenv"
import authRoutes from "./routes/auth.js"
import attendanceRoutes from "./routes/attendance.js"
import userRoutes from "./routes/users.js"
import taskRoutes from "./routes/tasks.js"
import editorSheetsRoutes from "./routes/editorSheets.js"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json({ limit: "50mb" }))
app.use(express.urlencoded({ limit: "50mb", extended: true }))

// MongoDB Connection
const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://vedaa:vedaa123@vedaa-ai.blmd84r.mongodb.net/office_management?retryWrites=true&w=majority&appName=vedaa-Ai"

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("[v0] Connected to MongoDB successfully")
    console.log("[v0] Database:", mongoose.connection.name)
  })
  .catch((error) => {
    console.error("[v0] MongoDB connection error:", error)
    process.exit(1)
  })

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/attendance", attendanceRoutes)
app.use("/api/users", userRoutes)
app.use("/api/tasks", taskRoutes)
app.use("/api/editor-sheets", editorSheetsRoutes)

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("[v0] Error:", err)
  res.status(500).json({
    error: "Internal server error",
    message: err.message,
  })
})

const startServer = (port) => {
  const server = app.listen(port, () => {
    console.log(`[v0] Server running on port ${port}`)
    console.log(`[v0] Health check: http://localhost:${port}/api/health`)
  })

  server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      console.log(`[v0] Port ${port} is busy, trying port ${port + 1}...`)
      startServer(port + 1)
    } else {
      console.error("[v0] Server error:", error)
      process.exit(1)
    }
  })
}

startServer(PORT)
