# Quick Restart Guide

## To apply the splash screen fix:

### Step 1: Stop your current development server
Press `Ctrl + C` in the terminal where the app is running

### Step 2: Clear the cache using one of these methods:

**Method A - Use the Clear Cache Tool (After starting the server):**
```
1. Start the server: npm start (in client folder)
2. Visit: http://localhost:3000/clear-cache.html
3. Click "Clear All Cache & Data"
```

**Method B - Browser DevTools:**
```
1. Open DevTools (F12)
2. Application tab → Clear storage
3. Click "Clear site data"
```

**Method C - Browser Settings:**
```
Press Ctrl + Shift + Delete
Select "Cached images and files" and "Cookies"
Click "Clear data"
```

### Step 3: Restart the development server
```bash
cd client
npm start
```

### Step 4: Test
1. Open http://localhost:3000
2. You should see onboarding slides (if not logged in)
3. Complete onboarding
4. Refresh - should NOT see splash screen flickering anymore!

## What was fixed:
✅ Changed onboarding state from sessionStorage to localStorage
✅ Updated service worker to not cache HTML documents
✅ Added initialization guard to prevent state loops
✅ Bumped cache version to force refresh
