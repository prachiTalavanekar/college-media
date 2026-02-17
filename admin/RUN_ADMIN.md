# Run Admin Panel - Quick Commands

## ✅ Admin User Already Created!

Your admin user is ready:
- Email: `prachi@admin.com`
- Password: `prachi1234`

## 🚀 Quick Start (Choose One)

### Option 1: Use Main App (Easiest)

```bash
# Just login at the main app
http://localhost:3000/admin/login
```

No extra setup needed! Admin routes are already in the main app.

### Option 2: Run Admin on Separate Port (3001)

```bash
# Terminal 1: Start server
cd server
npm run dev

# Terminal 2: Start admin panel
cd admin
npm install  # First time only
npm start    # Runs on port 3001

# Access at:
http://localhost:3001/admin/login
```

## 📋 Step-by-Step

### First Time Setup

```bash
# 1. Install admin dependencies
cd admin
npm install

# 2. Verify admin user exists
cd ../server
node scripts/listAdmins.js

# Should show: prachi@admin.com
```

### Every Time You Want to Use Admin

#### Method A: Via Main App (Port 3000)
```bash
# 1. Start server (if not running)
cd server
npm run dev

# 2. Start client (if not running)
cd client
npm start

# 3. Open browser
http://localhost:3000/admin/login

# 4. Login
Email: prachi@admin.com
Password: prachi1234
```

#### Method B: Separate Admin Panel (Port 3001)
```bash
# 1. Start server (if not running)
cd server
npm run dev

# 2. Start admin panel
cd admin
npm start

# 3. Open browser
http://localhost:3001/admin/login

# 4. Login
Email: prachi@admin.com
Password: prachi1234
```

## 🔧 Useful Commands

### Create/Update Admin User
```bash
cd server
node scripts/createAdminFromEnv.js
```

### List All Admins
```bash
cd server
node scripts/listAdmins.js
```

### Check Admin Credentials
```bash
cat admin/.env | grep ADMIN_
```

### Start Admin Panel
```bash
cd admin
npm start
```

### Change Admin Port
```bash
# Edit admin/.env
ADMIN_PORT=3002

# Or set inline
set PORT=3002 && npm start
```

## 🌐 Access URLs

| What | URL |
|------|-----|
| Admin via Main App | http://localhost:3000/admin/login |
| Admin Separate | http://localhost:3001/admin/login |
| Main App | http://localhost:3000 |
| Server API | http://localhost:5000/api |

## 🐛 Quick Fixes

### "Invalid Credentials"
```bash
cd server
node scripts/createAdminFromEnv.js
```

### Port Already in Use
```bash
# Kill process on port 3001
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Or use different port
set PORT=3002 && npm start
```

### Admin Panel Won't Start
```bash
cd admin
npm install
npm start
```

## ✅ Verification

### Test Login
```
1. Go to http://localhost:3000/admin/login
2. Email: prachi@admin.com
3. Password: prachi1234
4. Click "Sign In"
5. Should see dashboard ✅
```

### Check Admin User
```bash
cd server
node scripts/listAdmins.js

# Should show:
# Admin Users:
# - prachi@admin.com (System Administrator)
```

## 📝 Notes

- Admin user is already created in database ✅
- Credentials are in `admin/.env` ✅
- Can run on port 3000 (main app) or 3001 (separate) ✅
- Both methods work simultaneously ✅

## 🎯 Recommended Approach

**For Development:**
Use main app on port 3000 (easier, no extra setup)

**For Production:**
Run admin on separate port 3001 (better isolation)

---

**Quick Login:** http://localhost:3000/admin/login
**Email:** prachi@admin.com
**Password:** prachi1234
