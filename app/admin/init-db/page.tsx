"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function InitDB() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const handleInitialize = async () => {
    setLoading(true)
    setMessage("")
    setError("")

    try {
      const response = await fetch("/api/admin/init-db", {
        method: "POST",
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.details || data.error)
        return
      }

      setMessage(
        "Database initialized! You can now login with:\n\nAdmin: admin@company.com / admin123\nEmployee: john@company.com / employee123\nEmployee: jane@company.com / employee123",
      )
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="p-8 max-w-md">
        <h1 className="text-2xl font-bold mb-4">Initialize Database</h1>
        <p className="text-gray-600 mb-6">
          This will create demo users in your MongoDB database so you can test the login.
        </p>

        <Button onClick={handleInitialize} disabled={loading} className="w-full mb-4">
          {loading ? "Initializing..." : "Initialize Database"}
        </Button>

        {message && <div className="text-green-600 whitespace-pre-wrap text-sm">{message}</div>}
        {error && <div className="text-red-600 text-sm">{error}</div>}
      </Card>
    </div>
  )
}
