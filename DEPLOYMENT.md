# 🚀 Deployment Guide - Arabic Skribbl.io

## Backend Deployment Options

### Option 1: Railway (Recommended) ⭐

**Why Railway?**
- ✅ Free tier available
- ✅ Automatic deployments from GitHub
- ✅ Built-in domain
- ✅ Easy environment variables
- ✅ WebSocket support

**Steps:**
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Railway will auto-detect Node.js and deploy!
6. Your backend will be live at: `https://your-app-name.up.railway.app`

### Option 2: Render

**Steps:**
1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Click "New" → "Web Service"
4. Connect your GitHub repo
5. Settings:
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Environment:** Node
6. Deploy!

### Option 3: Heroku

**Steps:**
1. Install Heroku CLI
2. Login: `heroku login`
3. Create app: `heroku create skribble-arabic-backend`
4. Deploy: `git push heroku main`

## Frontend Deployment (Vercel)

**Steps:**
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Import your repository
4. Vercel auto-detects Next.js
5. Update environment variables:
   - Add your backend URL to the frontend

## Environment Variables

### Backend (.env)
```
NODE_ENV=production
PORT=3002
CORS_ORIGIN=https://your-frontend-domain.vercel.app
```

### Frontend (.env.local)
```
NEXT_PUBLIC_BACKEND_URL=https://your-backend-domain.railway.app
```

## Post-Deployment Steps

1. **Update CORS origins** in server.js with your actual domains
2. **Update frontend** to use production backend URL
3. **Test multiplayer** with the live URLs
4. **Share your game!** 🎉

## Quick Deploy Commands

```bash
# 1. Commit your changes
git add .
git commit -m "Ready for deployment"

# 2. Push to GitHub
git push origin main

# 3. Deploy to Railway/Render (automatic)
# 4. Deploy frontend to Vercel (automatic)
```

## Troubleshooting

**Common Issues:**
- **CORS errors:** Update origins in server.js
- **WebSocket issues:** Ensure platform supports WebSockets
- **Port issues:** Use `process.env.PORT` (already configured)

**Testing:**
- Test locally first: `npm run dev:full`
- Test production URLs in browser
- Check browser console for errors

## Cost Estimates

- **Railway:** Free tier (500 hours/month)
- **Render:** Free tier (750 hours/month)  
- **Vercel:** Free tier (unlimited for personal)
- **Total:** $0/month for MVP! 🎉

## Performance Tips

- **Railway:** Upgrade to Pro ($5/month) for better performance
- **CDN:** Vercel includes global CDN automatically
- **Monitoring:** Add error tracking (Sentry) later

Your Arabic Skribbl.io will be live worldwide! 🌍🎨 