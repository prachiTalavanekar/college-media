# Force Refresh Instructions

The colors have been updated in the code, but you're seeing cached files. Here's how to force a refresh:

## Method 1: Clear Cache Page (EASIEST)
1. Open: `http://localhost:3000/clear-cache.html`
2. Click "Clear All Cache & Data"
3. Wait for success message
4. App will reload automatically

## Method 2: Hard Refresh
1. **Windows/Linux**: Press `Ctrl + Shift + R`
2. **Mac**: Press `Cmd + Shift + R`
3. Or press `Ctrl + F5` (Windows)

## Method 3: Clear Browser Data Manually
1. Open Developer Tools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

## Method 4: Restart Development Server
```bash
# In your terminal where the server is running:
# 1. Stop the server (Ctrl+C)
# 2. Clear npm cache (optional)
npm cache clean --force
# 3. Restart
npm start
```

## Method 5: Clear Service Worker
1. Open Developer Tools (F12)
2. Go to "Application" tab
3. Click "Service Workers" in left sidebar
4. Click "Unregister" for all service workers
5. Click "Clear storage" 
6. Check all boxes and click "Clear site data"
7. Refresh the page

## What Was Updated:
✅ Service Worker cache version: v7 → v8
✅ index.css gradient colors: Purple → Oxford Blue
✅ App.css gradient colors: Purple → Oxford Blue
✅ Button glow effects: Blue → Oxford Blue
✅ OnboardingSlides: Already using Oxford Blue
✅ SplashScreen: Already using Oxford Blue

## New Colors:
- **Primary**: Oxford Blue (#002147 / #1e3a8a)
- **Secondary**: Tan (#d4a574)
- **Background**: Oxford Blue gradients
- **Accents**: Tan for highlights

After clearing cache, you should see:
- Dark blue onboarding slides (not bright purple/blue)
- Oxford blue buttons and UI elements
- Tan accent colors throughout
