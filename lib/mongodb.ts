import mongoose from "mongoose"

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable in Vercel settings or .env.local")
}

console.log("[v0] MongoDB URI configured:", MONGODB_URI.substring(0, 30) + "...")

// @ts-ignore
let cached = global.mongoose

if (!cached) {
  // @ts-ignore
  cached = global.mongoose = { conn: null, promise: null }
}

async function connectDB() {
  if (cached.conn) {
    console.log("[v0] Using cached MongoDB connection")
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      retryWrites: true,
    }

    console.log("[v0] Creating new MongoDB connection...")
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log("[v0] Connected to MongoDB successfully")
      console.log("[v0] Database:", mongoose.connection.name)
      console.log("[v0] Connection state:", mongoose.connection.readyState)
      return mongoose
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (e: any) {
    cached.promise = null
    console.error("[v0] MongoDB connection error:", e.message)
    console.error("[v0] Error code:", e.code)

    if (e.message.includes("ENOTFOUND")) {
      console.error("[v0] ❌ DNS resolution failed - check your internet connection or MongoDB URI")
    } else if (e.message.includes("ECONNREFUSED")) {
      console.error("[v0] ❌ Connection refused - MongoDB server may be down")
    } else if (e.message.includes("authentication failed")) {
      console.error("[v0] ❌ Authentication failed - check your username/password")
    } else if (e.message.includes("MongoServerSelectionError")) {
      console.error("[v0] ❌ Could not connect to MongoDB cluster")
      console.error("[v0] ⚠️  Solution: Whitelist your IP in MongoDB Atlas Network Access")
    }

    throw e
  }

  return cached.conn
}

export default connectDB
