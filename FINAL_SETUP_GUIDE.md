# Final Setup Guide - AttendEase with Next.js + MongoDB

Your attendance tracking application is now fully migrated to Next.js with integrated backend API routes and MongoDB database.

## Current Status
- **Database**: Disconnected (needs IP whitelisting)
- **Backend**: Next.js API routes ready at `/api/*`
- **Frontend**: Integrated into Next.js pages
- **Environment**: MongoDB credentials configured

## Step-by-Step Setup

### Step 1: Whitelist Your IP Address in MongoDB Atlas

**This is the MOST IMPORTANT step - your database won't connect without it!**

1. Go to https://cloud.mongodb.com/
2. Login with your credentials
3. Select your cluster "vedaa-Ai"
4. Click **"Network Access"** in the left sidebar (under Security)
5. Click **"Add IP Address"** button
6. Choose one option:
   - **"Add Current IP Address"** (recommended for development)
   - **"Allow Access from Anywhere"** (0.0.0.0/0) - less secure but works everywhere
7. Click **"Confirm"**
8. Wait 1-2 minutes for the changes to take effect

### Step 2: Initialize Your Database

Run this command to create demo users and sample data:

\`\`\`bash
npm run db:init
\`\`\`

This creates:
- **Admin Account**: admin@company.com / admin123
- **Employee Account 1**: john@company.com / john123
- **Employee Account 2**: sarah@company.com / sarah123

### Step 3: Start Your Application

\`\`\`bash
npm run dev
\`\`\`

Your app will start on **http://localhost:3000**

### Step 4: Verify Database Connection

Open http://localhost:3000/api/health in your browser.

You should see:
\`\`\`json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2025-12-23T..."
}
\`\`\`

If you see `"database": "disconnected"`, go back to Step 1 and verify your IP is whitelisted.

### Step 5: Login and Test

1. Go to http://localhost:3000/login
2. Use one of the demo accounts:
   - Admin: admin@company.com / admin123
   - Employee: john@company.com / john123
3. Test check-in/check-out functionality
4. View attendance records

## API Endpoints

All endpoints are at `/api/*`:

**Authentication**
- POST `/api/auth/login` - User login
- POST `/api/auth/register` - Register new user

**Attendance**
- POST `/api/attendance/checkin` - Check in
- POST `/api/attendance/checkout` - Check out
- GET `/api/attendance/today` - Today's records
- GET `/api/attendance/stats` - Statistics
- GET `/api/attendance/employee/:id` - Employee history
- GET `/api/attendance/employee/:id/today` - Employee today

**Users**
- GET `/api/users/count` - Total user count

**Health**
- GET `/api/health` - Database status

## Environment Variables

Your `.env` file should have:

\`\`\`
MONGODB_URI=mongodb+srv://vedaa:vedaa123@vedaa-ai.blmd84r.mongodb.net/office_management?retryWrites=true&w=majority&appName=vedaa-Ai
\`\`\`

## Troubleshooting

### Database Still Disconnected?
1. Double-check IP whitelisting in MongoDB Atlas
2. Try "Allow Access from Anywhere" (0.0.0.0/0)
3. Restart your app after whitelisting: `npm run dev`
4. Check MongoDB Atlas cluster is active (not paused)

### Port Already in Use?
Next.js will automatically try ports 3000, 3001, 3002, etc.

### Login Not Working?
1. Check `/api/health` shows database connected
2. Run `npm run db:init` to create demo users
3. Clear browser cache and try again
4. Check browser console for errors

### Build Errors?
Run `npm install` to ensure all dependencies are installed.

## What Changed from Before

**Before (Express + Vite):**
- Separate Express server on port 5000
- Vite dev server on port 8080
- Two servers to manage
- Complex CORS setup

**After (Next.js):**
- Single server on port 3000
- Backend and frontend integrated
- No CORS issues
- Ready for Vercel deployment
- Better performance with connection pooling

## Project Structure

\`\`\`
app/
├── api/              # Backend API routes
│   ├── auth/
│   ├── attendance/
│   ├── users/
│   └── health/
├── layout.tsx        # Root layout
├── page.tsx          # Main entry point
└── vite-app-wrapper.tsx  # Client component wrapper

lib/
├── mongodb.ts        # Database connection
└── models/           # Mongoose models

src/
├── components/       # React components
├── contexts/         # React contexts
├── pages/            # App pages
└── lib/              # Utilities

server/               # OLD - no longer used
scripts/
└── init-database.js  # Database seeding script
\`\`\`

## Next Steps

1. Deploy to Vercel with `vercel deploy`
2. Add production MongoDB connection string in Vercel dashboard
3. Configure environment variables in Vercel
4. Test production deployment

## Support

If you encounter issues:
1. Check MongoDB Atlas IP whitelist
2. Verify database connection at `/api/health`
3. Check browser console for errors
4. Review server logs in terminal

Your attendance tracking system is now ready to use with full MongoDB integration!
