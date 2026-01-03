# MongoDB Backend Integration Guide

## Overview
This application now includes a complete MongoDB backend with Express.js server for managing attendance and user authentication.

## Database Information
- **Connection String**: `mongodb+srv://vedaa:vedaa123@vedaa-ai.blmd84r.mongodb.net/office_management?retryWrites=true&w=majority&appName=vedaa-Ai`
- **Database Name**: `office_management`
- **Collections**: 
  - `users` - Stores user accounts
  - `attendancerecords` - Stores check-in/check-out records

## How to Run Both Frontend and Backend

### Option 1: Run Both Together (Recommended)
\`\`\`bash
npm run dev
\`\`\`
This command runs both the Vite frontend (port 5173) and Express backend (port 5000) concurrently.

### Option 2: Run Separately
\`\`\`bash
# Terminal 1 - Frontend
npm run frontend

# Terminal 2 - Backend
npm run backend
\`\`\`

## Project Structure

\`\`\`
├── server/
│   ├── index.js                 # Express server entry point
│   ├── models/
│   │   ├── User.js             # User model with auth
│   │   └── AttendanceRecord.js # Attendance tracking model
│   └── routes/
│       ├── auth.js             # Login/Register endpoints
│       ├── attendance.js       # Check-in/Check-out endpoints
│       └── users.js            # User management endpoints
└── src/
    ├── contexts/
    │   ├── AuthContext.tsx     # (Will be updated to use API)
    │   └── AttendanceContext.tsx # (Will be updated to use API)
    └── ... (rest of frontend code)
\`\`\`

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Create new user

### Attendance
- `POST /api/attendance/checkin` - Check in for the day
- `POST /api/attendance/checkout` - Check out
- `GET /api/attendance/employee/:employeeId` - Get employee's attendance history
- `GET /api/attendance/employee/:employeeId/today` - Get today's record for employee
- `GET /api/attendance/today` - Get all today's records
- `GET /api/attendance/date/:date` - Get records for specific date
- `GET /api/attendance/stats` - Get attendance statistics

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:userId` - Get specific user
- `PUT /api/users/:userId` - Update user
- `DELETE /api/users/:userId` - Delete user

### Health Check
- `GET /api/health` - Check server and database status

## Initial Database Setup

### Creating Default Users
You can create users using the register endpoint or by inserting directly into MongoDB. Here's an example using the API:

\`\`\`bash
# Create admin user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@company.com",
    "password": "admin123",
    "name": "Admin User",
    "role": "admin",
    "department": "Management"
  }'

# Create employee user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@company.com",
    "password": "john123",
    "name": "John Smith",
    "role": "employee",
    "department": "Engineering"
  }'
\`\`\`

## Viewing Your Database

### Using MongoDB Compass (Recommended)
1. Download MongoDB Compass from https://www.mongodb.com/products/compass
2. Connect using your connection string
3. Browse the `office_management` database
4. View and edit documents in `users` and `attendancerecords` collections

### Using MongoDB Atlas Web Interface
1. Go to https://cloud.mongodb.com/
2. Log in with your credentials
3. Select your cluster (vedaa-Ai)
4. Click "Browse Collections"
5. View the `office_management` database

## Next Steps

1. **Install Dependencies**:
   \`\`\`bash
   npm install
   \`\`\`

2. **Start the Application**:
   \`\`\`bash
   npm run dev
   \`\`\`

3. **Test the Backend**:
   - Open http://localhost:5000/api/health to verify the server is running
   - You should see a response indicating the database is connected

4. **Create Initial Users**:
   - Use the register endpoint or create users through the MongoDB interface

5. **Update Frontend** (Next task):
   - The frontend contexts will be updated to use the new API endpoints
   - This will replace the mock data with real database operations

## Environment Variables

Create a `.env` file in the project root if you want to customize:
\`\`\`env
MONGODB_URI=your_connection_string
PORT=5000
\`\`\`

## Troubleshooting

### Server won't start
- Check if port 5000 is already in use
- Verify MongoDB connection string is correct
- Check network connectivity

### Database connection fails
- Verify credentials in connection string
- Check MongoDB Atlas firewall rules (should allow connections from your IP)
- Ensure cluster is running

### Cannot create users
- Check server logs for error messages
- Verify email doesn't already exist in database
- Ensure all required fields are provided

## Security Notes

- Passwords are hashed using bcryptjs before storing
- Never commit `.env` files with real credentials
- In production, use environment variables for sensitive data
- Consider implementing JWT tokens for session management
