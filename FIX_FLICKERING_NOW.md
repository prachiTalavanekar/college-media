# Fix Flickering NOW - Quick Guide

## 🚨 Your Screen is Flickering?

Follow these 3 steps to fix it immediately:

## Step 1: Force Clear Cache (30 seconds)

### Option A: Use the Tool (Easiest)
```
1. Visit: http://localhost:3000/force-clear-cache.html
2. Click the big red button: "🔥 Force Clear Everything"
3. Wait 2 seconds
4. Done! ✅
```

### Option B: Manual Clear
```
1. Press F12 (open DevTools)
2. Go to "Application" tab
3. Click "Clear storage"
4. Click "Clear site data"
5. Close DevTools
6. Press Ctrl+Shift+R (hard refresh)
```

## Step 2: Restart Your App

```bash
# Stop the client (Ctrl+C in terminal)

# Start it again
cd client
npm start
```

## Step 3: Test

```
Visit: http://localhost:3000

Should work without flickering! ✅
```

## ✅ What Was Fixed

I updated the code to prevent the infinite loop:
- Fixed OnboardingContext.js
- Updated service worker to v5
- Created force-clear tool

## 🐛 Still Flickering?

Try this nuclear option:

```
1. Close ALL browser tabs
2. Press Ctrl+Shift+Delete
3. Select "All time"
4. Check "Cookies" and "Cached images"
5. Click "Clear data"
6. Restart browser
7. Visit app again
```

## 📝 Quick Commands

```bash
# Clear and restart everything
# 1. Visit: http://localhost:3000/force-clear-cache.html
# 2. Then:
cd client
npm start
```

## 🎯 Success = No Flickering

After the fix:
- ✅ Page loads smoothly
- ✅ No infinite refreshes
- ✅ No screen flashing
- ✅ Onboarding shows once
- ✅ Login works normally

---

**Quick Fix URL:** http://localhost:3000/force-clear-cache.html
**Time to Fix:** 30 seconds
**Status:** ✅ Code Fixed, Just Clear Cache!
