# Splash Screen Flickering Fix

## Problem
The splash screen was continuously refreshing/flickering due to:
1. Service worker aggressively caching HTML documents with stale state
2. Onboarding state using sessionStorage which wasn't persistent enough
3. Service worker serving cached versions causing state conflicts

## Solution Applied

### 1. Updated OnboardingContext.js
- Changed from `sessionStorage` to `localStorage` for persistent onboarding state
- Added `isInitialized` flag to prevent multiple state initializations
- This ensures onboarding completion is remembered across sessions

### 2. Updated Service Worker (sw.js)
- Bumped cache version from v3 to v4 (forces cache refresh)
- Removed HTML document caching (prevents stale state)
- Implemented network-first strategy for HTML documents
- Cache-first strategy only for static assets (images, fonts, etc.)

### 3. Created Clear Cache Tool
- Added `/clear-cache.html` page for easy cache clearing
- Unregisters service workers
- Clears all caches, localStorage, and sessionStorage

## How to Fix Right Now

### Option 1: Use the Clear Cache Tool (Easiest)
1. Navigate to: `http://localhost:3000/clear-cache.html`
2. Click "Clear All Cache & Data"
3. Wait for automatic redirect

### Option 2: Manual Browser Clear
1. Press `Ctrl + Shift + Delete` (Windows) or `Cmd + Shift + Delete` (Mac)
2. Select "Cached images and files"
3. Select "Cookies and other site data"
4. Click "Clear data"
5. Refresh the page

### Option 3: DevTools Method
1. Open DevTools (F12)
2. Go to Application tab
3. Click "Clear storage" in the left sidebar
4. Check all boxes
5. Click "Clear site data"

## Testing the Fix

After clearing cache:
1. Visit the app - you should see onboarding slides (if not logged in)
2. Complete onboarding
3. Refresh the page - should go directly to login/register (no flickering)
4. The splash screen should NOT appear again

## For Future Development

To prevent this issue:
- Never cache HTML documents in service workers
- Use localStorage for persistent user preferences
- Always bump cache version when updating service worker logic
- Test with cache disabled during development

## Files Modified
- `client/src/contexts/OnboardingContext.js` - Fixed state management
- `client/public/sw.js` - Fixed caching strategy
- `client/public/clear-cache.html` - Added cache clearing tool
