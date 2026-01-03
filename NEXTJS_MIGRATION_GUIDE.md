# Next.js Backend Migration Guide

Your attendance tracking application has been successfully migrated from Express.js + Vite to **Next.js with API Routes**.

## What Changed

### Backend Architecture
- **Before**: Separate Express server running on port 5000
- **After**: Next.js API routes integrated directly into the app
- **Database**: MongoDB connection now uses Next.js serverless functions with connection pooling

### New File Structure
\`\`\`
app/
├── api/
│   ├── auth/
│   │   ├── login/route.ts
│   │   └── register/route.ts
│   ├── attendance/
│   │   ├── checkin/route.ts
│   │   ├── checkout/route.ts
│   │   ├── stats/route.ts
│   │   ├── today/route.ts
│   │   └── employee/
│   │       └── [employeeId]/
│   │           ├── route.ts
│   │           └── today/route.ts
│   ├── users/
│   │   └── count/route.ts
│   └── health/route.ts
│
lib/
├── mongodb.ts (Connection pooling for serverless)
└── models/
    ├── User.ts
    └── AttendanceRecord.ts
\`\`\`

## How to Run

### 1. Install Dependencies (if not already done)
\`\`\`bash
npm install
\`\`\`

### 2. Configure Environment Variables
Make sure your `.env` file has the MongoDB connection string:
\`\`\`
MONGODB_URI=mongodb+srv://vedaa:vedaa123@vedaa-ai.blmd84r.mongodb.net/office_management?retryWrites=true&w=majority&appName=vedaa-Ai
\`\`\`

### 3. Whitelist Your IP in MongoDB Atlas
**IMPORTANT**: You must whitelist your IP address in MongoDB Atlas:

1. Go to https://cloud.mongodb.com
2. Select your cluster "vedaa-Ai"
3. Click "Network Access" in the left sidebar
4. Click "Add IP Address"
5. Select "Add Current IP Address" or "Allow Access from Anywhere" (0.0.0.0/0)
6. Click "Confirm"

### 4. Initialize the Database
\`\`\`bash
npm run db:init
\`\`\`

This will create demo users:
- **Admin**: admin@company.com / admin123
- **Employee**: john@company.com / john123
- **Employee**: sarah@company.com / sarah123

### 5. Start the Application
\`\`\`bash
npm run dev
\`\`\`

The app will run on **http://localhost:3000**

## API Endpoints

All API endpoints are now at `/api/*`:

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Attendance
- `POST /api/attendance/checkin` - Check in
- `POST /api/attendance/checkout` - Check out
- `GET /api/attendance/today` - Get today's records
- `GET /api/attendance/stats` - Get attendance statistics
- `GET /api/attendance/employee/[id]` - Get employee attendance history
- `GET /api/attendance/employee/[id]/today` - Get employee's today record

### Users
- `GET /api/users/count` - Get total user count

### Health Check
- `GET /api/health` - Check database connection status

## Key Benefits

1. **Single Server**: No need to run separate frontend and backend servers
2. **Serverless Ready**: Can deploy to Vercel with zero configuration
3. **Better Connection Pooling**: MongoDB connections are cached and reused
4. **TypeScript**: Full type safety across frontend and backend
5. **Simplified Deployment**: One command to deploy everything

## Troubleshooting

### Database Not Connecting
1. Verify your IP is whitelisted in MongoDB Atlas
2. Check `.env` file has correct MONGODB_URI
3. Visit `/api/health` to see connection status

### Port Already in Use
Next.js defaults to port 3000. If occupied, it will try 3001, 3002, etc. automatically.

### Build Errors
Run `npm run build` to identify any TypeScript or build issues before deployment.

## Notes

- The old `server/` directory is no longer used and can be removed
- Vite configuration is no longer needed for the backend
- All API calls work the same from the frontend - no changes needed to React components
