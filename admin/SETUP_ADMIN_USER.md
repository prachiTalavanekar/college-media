# Setup Admin User - Fix Invalid Credentials

## Problem
Getting "Invalid credentials" when trying to login to admin panel.

## Solution

You need to create the admin user in the database with the credentials from `admin/.env`.

## Quick Fix (3 Steps)

### Step 1: Create Admin User
```bash
# From project root
cd server
node scripts/createAdminFromEnv.js
```

This will:
- Read credentials from `admin/.env`
- Create admin user in database
- Or update existing admin user's password

### Step 2: Verify Credentials
```bash
# Check your admin credentials
cat admin/.env | grep ADMIN_
```

Should show:
```
ADMIN_EMAIL=prachi@admin.com
ADMIN_PASSWORD=prachi1234
```

### Step 3: Login
```
URL: http://localhost:3000/admin/login

Email: prachi@admin.com
Password: prachi1234
```

## Running Admin on Different Port (Port 3001)

### Option 1: Run Admin Panel Separately (Recommended)

The admin panel can run on port 3001 while main app runs on port 3000.

#### Setup:
```bash
# 1. Install dependencies (if not already done)
cd admin
npm install

# 2. Start admin panel on port 3001
npm start
```

#### Access:
- **Admin Panel:** http://localhost:3001/admin/login
- **Main App:** http://localhost:3000

### Option 2: Use Main App with Admin Routes

Keep using the main app on port 3000 with admin routes:

```bash
# Start main app
cd client
npm start
```

#### Access:
- **Admin Panel:** http://localhost:3000/admin/login
- **Main App:** http://localhost:3000

## Detailed Steps

### 1. Create Admin User in Database

```bash
# Navigate to server folder
cd server

# Run the admin creation script
node scripts/createAdminFromEnv.js
```

**Expected Output:**
```
✅ Connected to MongoDB
📧 Admin Email from admin/.env: prachi@admin.com
🎉 Admin user created successfully!
📧 Email: prachi@admin.com
🔑 Password: (from admin/.env)

✅ You can now login at: http://localhost:3000/admin/login
```

### 2. Verify Admin User Exists

```bash
# Check if admin user was created
cd server
node scripts/listAdmins.js
```

Should show your admin user with email `prachi@admin.com`.

### 3. Test Login

#### Using Main App (Port 3000):
```
http://localhost:3000/admin/login
```

#### Using Separate Admin App (Port 3001):
```bash
# Terminal 1: Start server
cd server
npm run dev

# Terminal 2: Start admin panel
cd admin
npm start
```

Then visit: `http://localhost:3001/admin/login`

## Troubleshooting

### Still Getting "Invalid Credentials"?

#### Check 1: Verify Admin User Exists
```bash
cd server
node scripts/listAdmins.js
```

#### Check 2: Verify Credentials Match
```bash
# Check admin/.env
cat admin/.env | grep ADMIN_

# Should match the email you're using to login
```

#### Check 3: Check Server Logs
```bash
# Start server with logs
cd server
npm run dev

# Look for authentication errors
```

#### Check 4: Recreate Admin User
```bash
# Delete and recreate
cd server
node scripts/createAdminFromEnv.js
```

### Port Already in Use?

If port 3001 is already in use:

```bash
# Option 1: Use different port
set PORT=3002 && npm start

# Option 2: Kill process on port 3001
# Windows:
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Then restart
npm start
```

## Configuration

### Admin Port Configuration

Edit `admin/.env`:
```env
ADMIN_PORT=3001
```

### Update Admin Panel URLs

If running on port 3001, update:
```env
CLIENT_URL=http://localhost:3001
```

## Running Both Apps

### Terminal 1: Server
```bash
cd server
npm run dev
```

### Terminal 2: Main App (Port 3000)
```bash
cd client
npm start
```

### Terminal 3: Admin Panel (Port 3001)
```bash
cd admin
npm start
```

## Access URLs

| App | URL |
|-----|-----|
| Main App | http://localhost:3000 |
| Admin Panel | http://localhost:3001/admin/login |
| Server API | http://localhost:5000/api |

## Quick Commands

```bash
# Create admin user
cd server && node scripts/createAdminFromEnv.js

# List all admins
cd server && node scripts/listAdmins.js

# Start admin panel on port 3001
cd admin && npm start

# Start main app on port 3000
cd client && npm start

# Start server
cd server && npm run dev
```

## Summary

1. ✅ Run `node scripts/createAdminFromEnv.js` to create admin user
2. ✅ Admin credentials are in `admin/.env`
3. ✅ Admin panel can run on port 3001
4. ✅ Main app runs on port 3000
5. ✅ Both can run simultaneously

## Next Steps

1. Create admin user: `cd server && node scripts/createAdminFromEnv.js`
2. Start admin panel: `cd admin && npm start`
3. Login at: http://localhost:3001/admin/login
4. Use credentials from `admin/.env`

---

**Admin Email:** prachi@admin.com
**Admin Password:** prachi1234
**Admin Port:** 3001
**Main App Port:** 3000
