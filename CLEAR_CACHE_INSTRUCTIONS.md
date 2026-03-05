# Clear Cache Instructions

The splash screen colors have been updated in the code, but you're seeing the old cached version. Here's how to see the new colors:

## Method 1: Use the Clear Cache Page (Easiest)
1. Navigate to: `http://localhost:3000/clear-cache.html`
2. Click "Clear All Cache & Data"
3. Wait for the success message
4. The app will automatically reload with the new colors

## Method 2: Manual Browser Cache Clear
1. Open your browser's Developer Tools (F12 or Right-click → Inspect)
2. Go to the "Application" tab (Chrome) or "Storage" tab (Firefox)
3. Click "Clear storage" or "Clear site data"
4. Check all boxes (Cache, Local Storage, Service Workers, etc.)
5. Click "Clear site data"
6. Refresh the page (Ctrl+Shift+R or Cmd+Shift+R)

## Method 3: Hard Refresh
1. Close all browser tabs with the app
2. Press Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
3. This forces the browser to reload without using cache

## Method 4: Restart Development Server
1. Stop the React development server (Ctrl+C)
2. Clear the build cache: `npm run build` or delete `node_modules/.cache`
3. Restart: `npm start`

## What Changed:
- Background: Oxford Blue gradient (dark blue)
- Accent colors: Tan/Gold throughout
- Text: White with tan accents
- Loading animation: Tan colored bars
- Floating particles: Tan colors

## Service Worker Cache Version
The cache version has been updated from `v6` to `v7` to force cache refresh.
