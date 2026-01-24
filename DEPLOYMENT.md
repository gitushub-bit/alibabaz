# Market Buddy 45 - Render Deployment Guide

## 🚀 Quick Deploy to Render

This guide will help you deploy your Market Buddy 45 application to Render.

### Prerequisites
- A [Render account](https://render.com) (free tier available)
- Your code pushed to a Git repository (GitHub, GitLab, or Bitbucket)
- Environment variables from your `.env` file

---

## Deployment Steps

### Option 1: Deploy Using render.yaml (Recommended)

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Configure for Render deployment"
   git push origin main
   ```

2. **Create a New Web Service on Render**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click **"New +"** → **"Blueprint"**
   - Connect your repository
   - Render will automatically detect the `render.yaml` file

3. **Configure Environment Variables**
   In the Render dashboard, add these environment variables:
   - `VITE_SUPABASE_PROJECT_ID` - Your Supabase project ID
   - `VITE_SUPABASE_PUBLISHABLE_KEY` - Your Supabase publishable key
   - `VITE_SUPABASE_URL` - Your Supabase URL
   - `VITE_TELEGRAM_BOT_TOKEN` - Your Telegram bot token
   - `VITE_TELEGRAM_CHAT_ID` - Your Telegram chat ID

4. **Deploy**
   - Click **"Apply"** to start the deployment
   - Render will automatically build and deploy your app

---

### Option 2: Manual Web Service Setup

1. **Create a New Web Service**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click **"New +"** → **"Web Service"**
   - Connect your repository

2. **Configure Build Settings**
   - **Name**: `market-buddy-45` (or your preferred name)
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free (or your preferred plan)

3. **Add Environment Variables**
   Same as Option 1 above

4. **Deploy**
   - Click **"Create Web Service"**
   - Render will build and deploy your app

---

## Environment Variables Setup

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_SUPABASE_PROJECT_ID` | Your Supabase project ID | `vrbexcodygzpzsxztdke` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/public key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `VITE_SUPABASE_URL` | Your Supabase project URL | `https://vrbexcodygzpzsxztdke.supabase.co` |
| `VITE_TELEGRAM_BOT_TOKEN` | Telegram bot token from @BotFather | `8330529371:AAGhhfB6D5ks9OGQLWR2...` |
| `VITE_TELEGRAM_CHAT_ID` | Your Telegram chat ID from @userinfobot | `-1003020888591` |

### How to Add Environment Variables on Render

1. Go to your web service dashboard
2. Click on **"Environment"** in the left sidebar
3. Click **"Add Environment Variable"**
4. Enter the key and value
5. Click **"Save Changes"**
6. Render will automatically redeploy with the new variables

---

## Post-Deployment

### Verify Deployment

1. **Check Build Logs**
   - Go to your service dashboard
   - Click on **"Logs"** to see build and runtime logs
   - Look for any errors

2. **Test Your Application**
   - Open the URL provided by Render (e.g., `https://market-buddy-45.onrender.com`)
   - Test all features, especially:
     - Supabase connection
     - Telegram notifications
     - Checkout flow

3. **Monitor Performance**
   - Check the **"Metrics"** tab for performance data
   - Monitor response times and error rates

---

## Troubleshooting

### Common Issues

#### Build Fails
- **Check Node version**: Ensure Node 20.x is being used
- **Check dependencies**: Run `npm install` locally to verify all dependencies install correctly
- **Check build logs**: Look for specific error messages in Render logs

#### App Doesn't Start
- **Verify start command**: Should be `npm start`
- **Check port**: App should listen on port 8080 (configured in `vite.config.ts`)
- **Check environment variables**: Ensure all required variables are set

#### Environment Variables Not Working
- **Vite prefix**: All client-side variables MUST start with `VITE_`
- **Rebuild required**: After adding/changing env vars, Render automatically rebuilds
- **Check spelling**: Variable names are case-sensitive

#### 404 Errors on Refresh
- This is a common SPA issue. The `serve` package with `-s` flag handles this automatically
- If issues persist, check the start command: `serve -s dist -l 8080`

---

## Local Testing Before Deployment

Test the production build locally before deploying:

```bash
# Install dependencies
npm install

# Build the production bundle
npm run build

# Test the production build locally
npm start
```

Visit `http://localhost:8080` to test the production build.

---

## Updating Your Deployment

### Automatic Deployments

Render can automatically deploy when you push to your main branch:

1. Go to your service **"Settings"**
2. Under **"Build & Deploy"**, enable **"Auto-Deploy"**
3. Select your branch (usually `main` or `master`)
4. Push changes to trigger automatic deployment

### Manual Deployments

1. Go to your service dashboard
2. Click **"Manual Deploy"** → **"Deploy latest commit"**
3. Or click **"Clear build cache & deploy"** if you need a fresh build

---

## Performance Optimization

### Free Tier Limitations

- **Spin down**: Free tier services spin down after 15 minutes of inactivity
- **Cold starts**: First request after spin down may take 30-60 seconds
- **Solution**: Upgrade to paid tier for always-on service

### Build Optimization

The app is already configured with:
- Vite for fast builds
- SWC for faster compilation
- Production optimizations enabled

---

## Security Best Practices

✅ **Already Configured:**
- `.env` files excluded from Git
- Environment variables managed through Render dashboard
- `.env.example` provided for reference

⚠️ **Important:**
- Never commit `.env` files to Git
- Rotate API keys if accidentally exposed
- Use Render's environment variable encryption

---

## Support & Resources

- [Render Documentation](https://render.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [Supabase Documentation](https://supabase.com/docs)

---

## Quick Reference

### Useful Commands

```bash
# Local development
npm run dev

# Production build
npm run build

# Test production build locally
npm start

# Preview build
npm run preview

# Lint code
npm run lint
```

### Render Dashboard URLs

- **Dashboard**: https://dashboard.render.com/
- **Logs**: `https://dashboard.render.com/web/[your-service-id]/logs`
- **Environment**: `https://dashboard.render.com/web/[your-service-id]/env`

---

## Next Steps

1. ✅ Configure deployment files (Done)
2. ✅ Update package.json (Done)
3. 🔄 Push code to Git repository
4. 🔄 Create Render account
5. 🔄 Deploy using render.yaml
6. 🔄 Add environment variables
7. 🔄 Test deployed application

---

**Your app is now ready to deploy to Render! 🎉**
