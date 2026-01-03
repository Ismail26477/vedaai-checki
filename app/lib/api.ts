const API_BASE_URL = "/api"

// API response types
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Auth API
export const authApi = {
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
    return response.json()
  },

  register: async (userData: {
    email: string
    password: string
    name: string
    role?: string
    department?: string
  }) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    })
    return response.json()
  },
}

// Attendance API
export const attendanceApi = {
  checkIn: async (data: {
    employeeId: string
    employeeName: string
    location: any
    deviceInfo?: any
    photoData?: string
  }) => {
    const response = await fetch(`${API_BASE_URL}/attendance/checkin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    return response.json()
  },

  checkOut: async (recordId: string, location: any, photoData?: string) => {
    const response = await fetch(`${API_BASE_URL}/attendance/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recordId, location, photoData }),
    })
    return response.json()
  },

  getEmployeeRecords: async (employeeId: string) => {
    if (!employeeId || employeeId === "undefined") {
      console.warn("[v0] attendanceApi - getEmployeeRecords called with invalid ID:", employeeId)
      return { success: false, records: [], error: "Invalid employee ID" }
    }
    const response = await fetch(`${API_BASE_URL}/attendance/employee/${employeeId}`)
    return response.json()
  },

  getTodayRecordForEmployee: async (employeeId: string) => {
    if (!employeeId || employeeId === "undefined") {
      return { success: false, record: null, error: "Invalid employee ID" }
    }
    const response = await fetch(`${API_BASE_URL}/attendance/employee/${employeeId}/today`)
    return response.json()
  },

  getTodayRecords: async () => {
    const response = await fetch(`${API_BASE_URL}/attendance/today`)
    return response.json()
  },

  getRecordsByDate: async (date: string) => {
    const response = await fetch(`${API_BASE_URL}/attendance/date/${date}`)
    return response.json()
  },

  getStats: async () => {
    const response = await fetch(`${API_BASE_URL}/attendance/stats`)
    return response.json()
  },
}

// Users API
export const usersApi = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/users`)
    return response.json()
  },

  getById: async (userId: string) => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`)
    return response.json()
  },

  update: async (userId: string, updates: any) => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    })
    return response.json()
  },

  delete: async (userId: string) => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: "DELETE",
    })
    return response.json()
  },
}

// Tasks API
export const tasksApi = {
  getPendingTasks: async () => {
    const response = await fetch(`${API_BASE_URL}/tasks/pending`)
    return response.json()
  },

  getAllTasks: async () => {
    const response = await fetch(`${API_BASE_URL}/tasks/all`)
    return response.json()
  },

  getEmployeeTasks: async (employeeId: string) => {
    if (!employeeId || employeeId === "undefined") return { success: false, data: [] }
    const response = await fetch(`${API_BASE_URL}/tasks/employee/${employeeId}`)
    return response.json()
  },

  createTask: async (taskData: any) => {
    const response = await fetch(`${API_BASE_URL}/tasks/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(taskData),
    })
    return response.json()
  },

  approveTask: async (approvalData: any) => {
    const response = await fetch(`${API_BASE_URL}/tasks/approve`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(approvalData),
    })
    return response.json()
  },
}

// Editor Sheets API
export const editorSheetsApi = {
  getSheets: async (employeeId: string) => {
    const response = await fetch(`${API_BASE_URL}/editor-sheets/employee/${employeeId}`)
    return response.json()
  },

  getByEditor: async (employeeId: string) => {
    console.log("[v0] API - getByEditor called with:", employeeId)
    const response = await fetch(`${API_BASE_URL}/editor-sheets/employee/${employeeId}`)
    const data = await response.json()
    console.log("[v0] API - getByEditor response:", data)
    if (data.success && (data.sheets || data.data)) {
      const sheetsArray = data.sheets || data.data || []
      const mappedSheets = (Array.isArray(sheetsArray) ? sheetsArray : []).map((sheet: any) => ({
        ...sheet,
        id: sheet._id || sheet.id, // Handle both _id and id formats
        title: sheet.sheetName || sheet.title,
      }))
      console.log("[v0] API - Mapped sheets:", mappedSheets)
      return { success: true, sheets: mappedSheets, data: mappedSheets }
    }
    return { success: false, sheets: [], data: [] }
  },

  create: async (data: {
    title: string
    description: string
    category: string
    dueDate: string
    editorId: string
    editorName: string
  }) => {
    console.log("[v0] API - create called with:", data)
    const payload = {
      employeeId: data.editorId,
      employeeName: data.editorName,
      sheetName: data.title,
      description: data.description,
      category: data.category,
      dueDate: data.dueDate,
    }
    console.log("[v0] API - sending payload:", payload)
    const response = await fetch(`${API_BASE_URL}/editor-sheets/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    const result = await response.json()
    console.log("[v0] API - create response:", result)
    if (result.success && result.sheet) {
      const mappedSheet = {
        ...result.sheet,
        id: result.sheet._id || result.sheet.id,
        title: result.sheet.sheetName || result.sheet.title,
      }
      console.log("[v0] API - Mapped created sheet:", mappedSheet)
      return {
        success: true,
        sheet: mappedSheet,
      }
    }
    return result
  },

  delete: async (sheetId: string) => {
    const response = await fetch(`${API_BASE_URL}/editor-sheets/${sheetId}`, {
      method: "DELETE",
    })
    return response.json()
  },

  addTask: async (sheetId: string, taskData: { date: string; title: string; link: string }) => {
    const response = await fetch(`${API_BASE_URL}/editor-sheets/${sheetId}/add-task`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(taskData),
    })
    return response.json()
  },

  updateTask: async (
    sheetId: string,
    taskId: string,
    updates: Partial<{ date: string; title: string; link: string }>,
  ) => {
    const response = await fetch(`${API_BASE_URL}/editor-sheets/${sheetId}/update-task`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId, ...updates }),
    })
    return response.json()
  },

  deleteTask: async (sheetId: string, taskId: string) => {
    const response = await fetch(`${API_BASE_URL}/editor-sheets/${sheetId}/delete-task?taskId=${taskId}`, {
      method: "DELETE",
    })
    return response.json()
  },

  getAllSheets: async () => {
    const response = await fetch(`${API_BASE_URL}/editor-sheets/all`)
    return response.json()
  },

  update: async (sheetId: string, updates: any) => {
    const response = await fetch(`/api/editor-sheets/${sheetId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    })
    return response.json()
  },
}

// Health check
export const healthCheck = async () => {
  const response = await fetch(`${API_BASE_URL}/health`)
  return response.json()
}
