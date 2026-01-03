"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import type { User } from "@/types/attendance"
import { authApi } from "@/app/lib/api"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock users for demo
const mockUsers: { email: string; password: string; user: User }[] = [
  {
    email: "admin@company.com",
    password: "admin123",
    user: {
      id: "1",
      email: "admin@company.com",
      name: "Admin User",
      role: "admin",
      department: "Management",
      createdAt: new Date(),
    },
  },
  {
    email: "john@company.com",
    password: "john123",
    user: {
      id: "2",
      email: "john@company.com",
      name: "John Smith",
      role: "employee",
      department: "Engineering",
      createdAt: new Date(),
    },
  },
  {
    email: "sarah@company.com",
    password: "sarah123",
    user: {
      id: "3",
      email: "sarah@company.com",
      name: "Sarah Johnson",
      role: "employee",
      department: "Design",
      createdAt: new Date(),
    },
  },
]

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const storedUser = localStorage.getItem("attendanceUser")
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (e) {
        console.error("[v0] Failed to parse stored user:", e)
        localStorage.removeItem("attendanceUser")
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true)

    try {
      const response = await authApi.login(email, password)

      if (response.success && response.user) {
        // Convert MongoDB _id to id for frontend consistency
        const userData = {
          ...response.user,
          id: response.user._id || response.user.id,
          createdAt: new Date(response.user.createdAt),
        }
        setUser(userData)
        localStorage.setItem("attendanceUser", JSON.stringify(userData))
        setIsLoading(false)
        router.push("/") // Redirect to home page after login
        return { success: true }
      }

      setIsLoading(false)
      return { success: false, error: response.error || "Invalid email or password" }
    } catch (error) {
      console.error("[v0] Login error:", error)
      setIsLoading(false)
      return { success: false, error: "Network error. Please check your connection." }
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("attendanceUser")
    router.push("/login") // Redirect to login page after logout
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
