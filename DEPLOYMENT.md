# Vercel Deployment Guide

This guide explains how to deploy your AttendEase application to Vercel with both frontend and backend running together.

## Prerequisites

- A Vercel account (sign up at https://vercel.com)
- MongoDB Atlas account with a connection string
- Git repository with your code

## Architecture

Your application uses **Next.js 16** with built-in API routes, combining both frontend and backend in a single deployment:

- **Frontend**: Next.js pages in `/app` and `/src/pages`
- **Backend API**: Next.js API routes in `/app/api`
- **Database**: MongoDB via Mongoose

## Deployment Steps

### 1. Push Your Code to Git

Make sure your code is pushed to GitHub, GitLab, or Bitbucket.

\`\`\`bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
\`\`\`

### 2. Import Project to Vercel

1. Go to https://vercel.com/new
2. Click "Import Project"
3. Select your Git repository
4. Vercel will auto-detect Next.js configuration

### 3. Configure Environment Variables

In the Vercel project settings, add the following environment variable:

**Required:**
- **Key**: `MONGODB_URI`
- **Value**: Your MongoDB connection string
  - Example: `mongodb+srv://username:password@cluster.mongodb.net/office_management?retryWrites=true&w=majority`

**How to add:**
1. Go to Project Settings → Environment Variables
2. Add the variable name and value
3. Select which environments it applies to (Production, Preview, Development)
4. Click "Save"

### 4. Deploy

1. Click "Deploy"
2. Vercel will build and deploy your application
3. Your app will be live at `https://your-project-name.vercel.app`

## Post-Deployment

### Testing Your Deployment

1. Visit your deployed URL
2. Try logging in with demo credentials:
   - Admin: `admin@company.com` / `admin123`
   - Employee: `john@company.com` / `john123`
3. Test check-in/check-out functionality
4. Verify camera photo capture works
5. Check admin dashboard features

### Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow Vercel's DNS configuration instructions

## Troubleshooting

### MongoDB Connection Issues

- Verify your `MONGODB_URI` is correct
- Check MongoDB Atlas IP whitelist (add `0.0.0.0/0` to allow all IPs)
- Ensure your database user has proper permissions

### API Routes Not Working

- Check browser console for errors
- Verify environment variables are set correctly
- Look at Vercel deployment logs for server errors

### Build Failures

- Check the build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify TypeScript errors are resolved

## File Structure

\`\`\`
your-project/
├── app/                    # Next.js App Router pages
│   ├── api/               # Backend API routes (✅ ACTIVE)
│   │   ├── auth/          # Authentication endpoints
│   │   ├── attendance/    # Attendance endpoints
│   │   └── users/         # User management endpoints
│   ├── layout.tsx
│   └── page.tsx
├── src/                   # Frontend source code
│   ├── components/        # React components
│   ├── contexts/          # React contexts
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility libraries & API client
│   ├── pages/             # Page components
│   └── types/             # TypeScript types
├── lib/                   # Shared backend libraries
│   └── models/            # Mongoose models
├── server/                # ⚠️  DEPRECATED Express server (not used in deployment)
├── public/                # Static assets
└── package.json
\`\`\`

## Important Notes

1. **Express Server Not Needed**: The `/server` folder contains an old Express.js backend that is no longer used. All API functionality is now handled by Next.js API routes in `/app/api`.

2. **Automatic Scaling**: Vercel automatically scales your application based on traffic.

3. **Serverless Functions**: Each API route in `/app/api` becomes a serverless function.

4. **Cold Starts**: First request after inactivity may take 2-3 seconds (cold start). Subsequent requests are fast.

5. **MongoDB Connection Pooling**: The MongoDB connection is automatically cached by Next.js for optimal performance.

## Support

If you encounter issues:
- Check Vercel deployment logs
- Review MongoDB Atlas logs
- Check browser console for client-side errors
- Verify all environment variables are set correctly

## Continuous Deployment

Once configured, Vercel automatically deploys:
- **Production**: Every push to `main` branch
- **Preview**: Every push to other branches or pull requests

This gives you automatic staging environments for testing before production!
