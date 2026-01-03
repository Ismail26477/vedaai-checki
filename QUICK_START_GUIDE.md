# Quick Start Guide - Fix Database Connection Issues

## Problem Summary
Your application cannot connect to MongoDB Atlas because your IP address is not whitelisted. This is why:
- Login fails with 500 errors
- No tables (collections) are created in the database
- All API calls timeout

## Solution: 3 Simple Steps

### Step 1: Whitelist Your IP Address in MongoDB Atlas

1. **Go to MongoDB Atlas**
   - Visit: https://cloud.mongodb.com/
   - Log in with your credentials

2. **Add Your IP to Whitelist**
   - Click "Network Access" in the left sidebar (under Security)
   - Click the green "ADD IP ADDRESS" button
   - Click "ADD CURRENT IP ADDRESS" (MongoDB will detect your IP automatically)
   - Click "Confirm"

   **Alternative (For Development Only):**
   - Click "ALLOW ACCESS FROM ANYWHERE"
   - This adds `0.0.0.0/0` (less secure but works for testing)

3. **Wait for Changes**
   - Wait 1-2 minutes for changes to take effect
   - You'll see a green "Active" status when ready

### Step 2: Start Your Application

Open your terminal in the project folder and run:

\`\`\`bash
npm run dev
\`\`\`

This command will:
- Start the frontend on `http://localhost:8080`
- Start the backend server on `http://localhost:5000`
- Both run concurrently

**Watch the console for:**
\`\`\`
[v0] Connected to MongoDB successfully
[v0] Database: office_management
[v0] Server running on port 5000
\`\`\`

If you see connection errors, go back to Step 1 and verify your IP is whitelisted.

### Step 3: Initialize the Database with Sample Data

Once the server is connected, **open a NEW terminal** (keep the first one running) and run:

\`\`\`bash
npm run db:init
\`\`\`

This will create:
- **Admin account**: admin@company.com / admin123
- **Employee accounts**: 
  - john@company.com / employee123
  - jane@company.com / employee123
- **Sample attendance records** for the last 7 days

**Expected output:**
\`\`\`
Connected to MongoDB successfully
Created 3 users
Created 14 attendance records
Database initialization complete!
\`\`\`

### Step 4: Login and Test

1. Open your browser to `http://localhost:8080`
2. You'll be redirected to the login page
3. Login with one of these accounts:

**Admin Account:**
- Email: `admin@company.com`
- Password: `admin123`
- Access: Full dashboard, manage all employees

**Employee Accounts:**
- Email: `john@company.com` or `jane@company.com`
- Password: `employee123`
- Access: Personal attendance, check-in/check-out

## Verify Database in MongoDB Atlas

1. Go to MongoDB Atlas → "Database" → "Browse Collections"
2. Select `office_management` database
3. You should see 2 collections:
   - `users` (3 documents)
   - `attendancerecords` (14 documents)

## Common Issues & Solutions

### Issue: "Still getting timeout errors after whitelisting IP"
**Solution:**
- Wait 2-3 minutes after adding the IP whitelist
- Restart your development server (stop with Ctrl+C, run `npm run dev` again)
- Check if your IP address changed (dynamic IP from ISP)

### Issue: "Port 5000 already in use"
**Solution:**
- The server will automatically try ports 5001, 5002, etc.
- Check the console to see which port it's using
- Or stop the process using port 5000

### Issue: "Cannot find module 'bcryptjs'"
**Solution:**
\`\`\`bash
npm install
\`\`\`

### Issue: "Login still fails after database init"
**Solution:**
- Check the browser console for errors
- Verify the backend is running (check `http://localhost:5000/api/health`)
- Make sure you're using the correct email/password from the demo accounts

### Issue: "My IP keeps changing"
**Solution:**
- Your ISP uses dynamic IP addresses
- For development: Use "Allow access from anywhere" (0.0.0.0/0)
- For production: Get a static IP or use MongoDB VPC peering

## Project Structure

\`\`\`
project/
├── server/              # Backend Express server
│   ├── index.js        # Main server file
│   ├── models/         # Mongoose schemas
│   └── routes/         # API endpoints
├── scripts/            # Database utilities
│   └── init-database.js # Initialize with sample data
├── src/                # Frontend React app
│   ├── contexts/       # Auth & Attendance state
│   ├── pages/          # Login, Dashboard, etc.
│   └── components/     # UI components
├── .env                # Environment variables
└── package.json        # Dependencies & scripts
\`\`\`

## Available Scripts

\`\`\`bash
npm run dev        # Run frontend + backend concurrently
npm run frontend   # Run only frontend (port 8080)
npm run backend    # Run only backend (port 5000)
npm run db:init    # Initialize database with sample data
npm run build      # Build for production
\`\`\`

## Environment Variables

Your `.env` file contains:

\`\`\`env
MONGODB_URI=mongodb+srv://vedaa:vedaa123@vedaa-ai.blmd84r.mongodb.net/office_management?retryWrites=true&w=majority&appName=vedaa-Ai
PORT=5000
VITE_API_URL=http://localhost:5000/api
\`\`\`

Make sure this file exists in your project root.

## Need More Help?

1. Check `MONGODB_CONNECTION_FIX.md` for detailed MongoDB Atlas instructions
2. Check `MONGODB_SETUP.md` for advanced database configuration
3. Check server logs for specific error messages

## Security Note

For production deployment:
- Remove "0.0.0.0/0" from IP whitelist
- Add only specific server IPs
- Use environment variables for sensitive data
- Enable MongoDB Atlas encryption
- Use stronger passwords

---

**You're all set!** Once you complete Steps 1-3, your application will be fully functional with a working database connection and sample data to test with.
