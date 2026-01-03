"use client"

import { Toaster } from "@/components/ui/toaster"
import { Toaster as Sonner } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { AttendanceProvider } from "@/app/contexts/AttendanceContext"
import Login from "@/app/pages/Login"

const queryClient = new QueryClient()

export default function LoginPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <AttendanceProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Login />
        </TooltipProvider>
      </AttendanceProvider>
    </QueryClientProvider>
  )
}
