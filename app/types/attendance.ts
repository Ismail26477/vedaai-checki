export interface User {
  id: string
  email: string
  name: string
  role: "admin" | "employee"
  department?: string
  avatar?: string
  createdAt: Date
}

export interface Location {
  latitude: number
  longitude: number
  address?: string
  accuracy?: number // GPS accuracy in meters
}

export interface AttendanceRecord {
  id: string
  employeeId: string
  employeeName: string
  date: string
  checkInTime: Date | null
  checkInLocation: Location | null
  checkOutTime: Date | null
  checkOutLocation: Location | null
  totalHours: number | null
  status: "checked-in" | "checked-out" | "absent"
  deviceInfo?: {
    ip?: string
    browser?: string
    userAgent?: string
  }
  photoData?: string
  checkOutPhotoData?: string
}

export interface AttendanceStats {
  totalEmployees: number
  presentToday: number
  checkedOut: number
  avgWorkHours: number
}

export interface EditorTask {
  id: string
  date: string
  title: string
  link: string
  sheetId: string
  createdAt: Date
}

export interface EditorSheet {
  id: string
  employeeId: string
  name: string // e.g., "Sheet1", "Sheet2"
  createdAt: Date
}
