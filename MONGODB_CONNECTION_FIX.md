# MongoDB Connection Fix Guide

## Problem
Your MongoDB Atlas cluster is blocking connections because your IP address is not whitelisted. This prevents:
- Database connection from establishing
- Collections (tables) from being created
- User login from working

## Error Message
\`\`\`
MongooseServerSelectionError: Could not connect to any servers in your MongoDB Atlas cluster. 
One common reason is that you're trying to access the database from an IP that isn't whitelisted.
\`\`\`

## Solution: Add Your IP Address to MongoDB Atlas Whitelist

### Step 1: Go to MongoDB Atlas
1. Visit https://cloud.mongodb.com/
2. Log in with your credentials

### Step 2: Navigate to Network Access
1. Click on "Network Access" in the left sidebar (under Security section)
2. Click the "ADD IP ADDRESS" button

### Step 3: Allow Your Current IP
**Option A: Allow Current IP (Recommended for Development)**
1. Click "ADD CURRENT IP ADDRESS"
2. MongoDB will automatically detect your IP
3. Click "Confirm"

**Option B: Allow All IPs (Not Recommended for Production)**
1. Click "ALLOW ACCESS FROM ANYWHERE"
2. This adds `0.0.0.0/0` to the whitelist
3. Click "Confirm"
4. ⚠️ WARNING: Only use this for testing! Remove it before production.

### Step 4: Wait for Changes to Apply
- It takes 1-2 minutes for the changes to propagate
- You'll see a green "Active" status when ready

### Step 5: Restart Your Application
\`\`\`bash
npm run dev
\`\`\`

## After IP Whitelisting: Initialize Database

Once connected, run the initialization script to create sample users and data:

### Option 1: Using the Setup Script (Recommended)
\`\`\`bash
node scripts/init-database.js
\`\`\`

This will create:
- Admin user (admin@company.com / admin123)
- 2 Employee users (john@company.com / employee123, jane@company.com / employee123)
- Sample attendance records

### Option 2: Manual Creation via MongoDB Atlas
1. Go to "Database" → "Browse Collections"
2. Click "Create Database"
3. Database name: `office_management`
4. Collection name: `users`
5. Click "Create"
6. Repeat for `attendancerecords` collection

## Verify Connection

After whitelisting your IP, check the server logs:
- ✅ You should see: `[v0] Connected to MongoDB successfully`
- ✅ Database operations should work without timeout errors

## Common Issues

### Issue 1: "Still getting timeout errors"
- Wait 2-3 minutes after adding IP whitelist
- Restart your dev server
- Check if your IP address changed (dynamic IP)

### Issue 2: "IP address keeps changing"
- Your ISP uses dynamic IPs
- Solution: Add IP range or use "Allow from anywhere" for development
- For production: Use static IP or MongoDB VPC peering

### Issue 3: "Can't find Network Access in Atlas"
- Make sure you're in the correct project
- Check you have admin permissions for the cluster

## Testing the Connection

Run this curl command to test if the API is working:
\`\`\`bash
curl http://localhost:5000/api/health
\`\`\`

Expected response:
\`\`\`json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2025-01-XX..."
}
\`\`\`

## Next Steps After Connection Works

1. Run the database initialization script (see above)
2. Try logging in with demo accounts:
   - Admin: `admin@company.com` / `admin123`
   - Employee: `john@company.com` / `employee123`
3. Check MongoDB Atlas to see collections populated with data
