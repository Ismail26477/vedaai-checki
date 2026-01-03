"use client"

import type React from "react"
import { AuthProvider } from "@/app/contexts/AuthContext"
import { AttendanceProvider } from "@/app/contexts/AttendanceContext"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "@/components/ui/toaster"
import { Toaster as Sonner } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"

const queryClient = new QueryClient()

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <AttendanceProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            {children}
          </TooltipProvider>
        </AttendanceProvider>
      </QueryClientProvider>
    </AuthProvider>
  )
}
