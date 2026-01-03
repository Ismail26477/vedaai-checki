import mongoose from "mongoose"
import dotenv from "dotenv"
import bcrypt from "bcryptjs"

dotenv.config()

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://vedaa:vedaa123@vedaa-ai.blmd84r.mongodb.net/office_management?retryWrites=true&w=majority&appName=vedaa-Ai"

// User Schema
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "employee"], default: "employee" },
  department: String,
  position: String,
  createdAt: { type: Date, default: Date.now },
})

const User = mongoose.model("User", UserSchema)

// Attendance Record Schema
const AttendanceRecordSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  userName: { type: String, required: true },
  checkInTime: { type: Date, required: true },
  checkInLocation: {
    latitude: Number,
    longitude: Number,
    address: String,
  },
  checkOutTime: Date,
  checkOutLocation: {
    latitude: Number,
    longitude: Number,
    address: String,
  },
  status: { type: String, enum: ["present", "absent", "late", "on-leave"], default: "present" },
  date: { type: Date, required: true },
  totalHours: Number,
  notes: String,
})

const AttendanceRecord = mongoose.model("AttendanceRecord", AttendanceRecordSchema)

async function initDatabase() {
  try {
    console.log("🔌 Connecting to MongoDB...")
    await mongoose.connect(MONGODB_URI)
    console.log("✅ Connected to MongoDB successfully")
    console.log("📦 Database:", mongoose.connection.name)

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log("\n🗑️  Clearing existing data...")
    await User.deleteMany({})
    await AttendanceRecord.deleteMany({})
    console.log("✅ Cleared existing data")

    // Create sample users
    console.log("\n👥 Creating sample users...")

    const adminPassword = await bcrypt.hash("admin123", 10)
    const employeePassword = await bcrypt.hash("employee123", 10)

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
        name: "John Doe",
        email: "john@company.com",
        password: employeePassword,
        role: "employee",
        department: "Engineering",
        position: "Software Developer",
      },
      {
        name: "Jane Smith",
        email: "jane@company.com",
        password: employeePassword,
        role: "employee",
        department: "Design",
        position: "UI/UX Designer",
      },
    ])

    console.log(`✅ Created ${users.length} users`)
    users.forEach((user) => {
      console.log(`   - ${user.name} (${user.email}) - Role: ${user.role}`)
    })

    // Create sample attendance records for the last 7 days
    console.log("\n📅 Creating sample attendance records...")

    const attendanceRecords = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (let i = 0; i < 7; i++) {
      const recordDate = new Date(today)
      recordDate.setDate(today.getDate() - i)

      // Create records for John and Jane (skip admin)
      for (let j = 1; j < users.length; j++) {
        const user = users[j]
        const checkInTime = new Date(recordDate)
        checkInTime.setHours(9, Math.floor(Math.random() * 30), 0, 0) // Random check-in between 9:00-9:30

        const checkOutTime = new Date(checkInTime)
        checkOutTime.setHours(17, Math.floor(Math.random() * 60), 0, 0) // Random check-out between 17:00-18:00

        const totalHours = (checkOutTime - checkInTime) / (1000 * 60 * 60) // Convert to hours

        attendanceRecords.push({
          userId: user._id,
          userName: user.name,
          checkInTime: checkInTime,
          checkInLocation: {
            latitude: 37.7749 + Math.random() * 0.01,
            longitude: -122.4194 + Math.random() * 0.01,
            address: "Office Location, San Francisco, CA",
          },
          checkOutTime: checkOutTime,
          checkOutLocation: {
            latitude: 37.7749 + Math.random() * 0.01,
            longitude: -122.4194 + Math.random() * 0.01,
            address: "Office Location, San Francisco, CA",
          },
          status: checkInTime.getHours() > 9 ? "late" : "present",
          date: recordDate,
          totalHours: Number.parseFloat(totalHours.toFixed(2)),
          notes: i === 0 ? "Today's attendance" : `Attendance for ${i} days ago`,
        })
      }
    }

    await AttendanceRecord.insertMany(attendanceRecords)
    console.log(`✅ Created ${attendanceRecords.length} attendance records`)

    // Display summary
    console.log("\n📊 Database Summary:")
    console.log(`   Total Users: ${await User.countDocuments()}`)
    console.log(`   Total Attendance Records: ${await AttendanceRecord.countDocuments()}`)

    console.log("\n🎉 Database initialization complete!")
    console.log("\n🔑 Login Credentials:")
    console.log("   Admin:")
    console.log("     Email: admin@company.com")
    console.log("     Password: admin123")
    console.log("   Employees:")
    console.log("     Email: john@company.com / jane@company.com")
    console.log("     Password: employee123")

    await mongoose.connection.close()
    console.log("\n✅ Database connection closed")
    process.exit(0)
  } catch (error) {
    console.error("\n❌ Error initializing database:", error)
    console.error("\n⚠️  Make sure:")
    console.error("   1. Your IP address is whitelisted in MongoDB Atlas")
    console.error("   2. Your MongoDB credentials are correct")
    console.error("   3. Your network connection is stable")
    process.exit(1)
  }
}

// Run initialization
initDatabase()
