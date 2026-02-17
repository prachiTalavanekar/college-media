# Standalone Admin Panel Setup

## ✅ Complete Standalone Admin App Created!

Your admin panel is now a complete, separate React application that runs on port 3001.

## 🚀 Quick Start

### Step 1: Install Dependencies
```bash
cd admin
npm install
```

This will install all required packages (React, React Router, Tailwind, etc.)

### Step 2: Start Admin Panel
```bash
npm start
``
The admin panel will start on **port 3001**.

### Step 3: Access Admin
```
URL: http://localhost:3001/login

Credentials:
Email: prachi@admin.com
Password: prachi1234
```

## 📁 Admin Folder Structure

```
admin/
├── public/              # Public assets (copied from client)
│   ├── index.html
│   ├── favicon.ico
│   └── ...
├── src/                 # Source code
│   ├── index.js         # Entry point
│   ├── App.js           # Main app component
│   ├── index.css        # Global styles
│   ├── contexts/        # React contexts
│   │   └── AuthContext.js
│   ├── pages/           # Page components
│   │   ├── AdminLogin.js
│   │   └── AdminDashboard.js
│   └── utils/           # Utilities
│       └── api.js       # API helper
├── .env                 # Admin credentials
├── package.json         # Dependencies
├── tailwind.config.js   # Tailwind configuration
└── postcss.config.js    # PostCSS configuration
```

## 🔧 Available Commands

```bash
# Install dependencies
npm install

# Start admin panel (port 3001)
npm start

# Build for production
npm build

# Create/update admin user
npm run create-admin

# List all admins
npm run list-admins
```

## 🌐 Ports

| Service | Port | URL |
|---------|------|-----|
| Server (API) | 5000 | http://localhost:5000/api |
| Main App | 3000 | http://localhost:3000 |
| **Admin Panel** | **3001** | **http://localhost:3001** |

## 📝 Running Everything

### Terminal 1: Server
```bash
cd server
npm run dev
```

### Terminal 2: Main App (Optional)
```bash
cd client
npm start
```

### Terminal 3: Admin Panel
```bash
cd admin
npm install  # First time only
npm start
```

## ✅ What's Different

### Standalone Admin (Port 3001)
- ✅ Separate React app
- ✅ Own dependencies
- ✅ Own build process
- ✅ Runs on port 3001
- ✅ Independent from main app
- ✅ Dark slate theme
- ✅ Admin-specific routing

### Main App Admin (Port 3000)
- Integrated in main app
- Shares dependencies
- Runs on port 3000
- Part of main app

## 🎨 Features

- ✅ Complete React app structure
- ✅ React Router for navigation
- ✅ Tailwind CSS for styling
- ✅ Hot reload during development
- ✅ Separate authentication context
- ✅ API integration
- ✅ Toast notifications
- ✅ Protected routes

## 🔐 Authentication

The admin panel uses:
- Separate localStorage keys (`admin_token`, `admin_user`)
- Admin-specific auth context
- Protected routes
- Auto-redirect on unauthorized access

## 🐛 Troubleshooting

### Dependencies not installed?
```bash
cd admin
npm install
```

### Port 3001 already in use?
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Or change port
set PORT=3002 && npm start
```

### Admin user doesn't exist?
```bash
cd admin
npm run create-admin
```

### Build errors?
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📚 Documentation

- **This file:** Standalone setup guide
- **admin/.env:** Admin credentials
- **admin/README.md:** Complete documentation
- **ADMIN_FINAL_SOLUTION.md:** Alternative setup

## 🎉 Success!

Your admin panel is now:
- ✅ A complete standalone React app
- ✅ Running on its own port (3001)
- ✅ Independent from main app
- ✅ Fully functional
- ✅ Ready to use!

---

**Quick Start:**
```bash
cd admin
npm install
npm start
```

**Access:** http://localhost:3001/login
**Email:** prachi@admin.com
**Password:** prachi1234
