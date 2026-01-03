"use client"

import { SecurityCheckIn } from "@/components/attendance/SecurityCheckIn"
import { DailySummary } from "@/components/attendance/DailySummary"
import { AttendanceCalendar } from "@/components/attendance/AttendanceCalendar"
import { AttendanceHistory } from "@/components/attendance/AttendanceHistory"

export function AttendanceSection() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-8 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Attendance Tracking</h1>
        <p className="text-blue-100">Check in and out with secure photo capture</p>
      </div>

      {/* Check In/Out Card */}
      <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-md border border-slate-200 dark:border-slate-700">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Mark Your Attendance</h2>
        <SecurityCheckIn />
      </div>

      {/* Daily Summary */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-slate-200 dark:border-slate-700">
        <DailySummary />
      </div>

      {/* Calendar and History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-slate-200 dark:border-slate-700">
          <AttendanceCalendar />
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Recent Activity</h3>
          <AttendanceHistory />
        </div>
      </div>
    </div>
  )
}
