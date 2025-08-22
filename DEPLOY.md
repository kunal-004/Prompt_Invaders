# Vercel Deployment Guide

## Quick Deploy Commands

### 1. Deploy Backend First
```bash
cd server
vercel --prod
```

### 2. Deploy Frontend
```bash  
cd client
vercel --prod
```

## Environment Variables Setup

### Backend (Vercel Dashboard)
- `GEMINI_API_KEY`: Your Google Gemini AI API key
- `MONGODB_URI`: Your MongoDB Atlas connection string  
- `NODE_ENV`: production

### Frontend (Vercel Dashboard)
- `VITE_API_URL`: https://your-backend-domain.vercel.app
- `VITE_SOCKET_URL`: https://your-backend-domain.vercel.app

## Pre-deployment Checklist

✅ Build passes locally (`npm run build`)
✅ Environment variables configured
✅ MongoDB Atlas database created
✅ Gemini AI API key obtained
✅ CORS origins updated in server for production domains

## Common Issues

- **CORS errors**: Update allowed origins in `server/index.js`
- **API not found**: Check environment variables in Vercel dashboard
- **Database connection**: Ensure MongoDB URI includes credentials and whitelist Vercel IPs
