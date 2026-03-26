# CollegeConnect - Private Academic Social Network

A verified, college-exclusive social platform that centralizes communication between students, alumni, teachers, and administration.

## 🎯 Core Purpose

- **Centralized Communication**: Replace fragmented WhatsApp groups and notice boards
- **Verified Community**: Only verified college members can participate
- **Alumni Bridge**: Connect current students with graduated alumni
- **Education-First**: Content focused on academics, opportunities, and college life

---

## 📋 Table of Contents

- [Features](#-features)
- [User Roles](#-user-roles)
- [Technology Stack](#-technology-stack)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Quick Start](#-quick-start)
- [Admin Panel](#-admin-panel)
- [Email Setup](#-email-setup)
- [Project Structure](#-project-structure)
- [Available Scripts](#-available-scripts)
- [Troubleshooting](#-troubleshooting)

---

## ✨ Features

### Core Features
- 🔐 **Role-Based Access Control (RBAC)** - Students, Teachers, Alumni, Principal, Admin
- ✅ **User Verification System** - Admin approval required for new users
- 📧 **Email Notifications** - Automated verification emails
- 👥 **Communities** - Department, course, batch-wise groups
- 📱 **Progressive Web App (PWA)** - Install as mobile app
- 🎨 **Modern UI** - Responsive design with Tailwind CSS

### Content Types
- 📢 **Announcements** - Teachers/Principal/Admin only
- 📝 **Blogs** - All users
- 🎥 **Reels** - Short video content
- 📸 **Stories** - 24-hour temporary posts
- 📅 **Events** - With registration links
- 📊 **Polls** - Interactive voting
- 💼 **Opportunities** - Jobs, internships, freelance

### Social Features
- ❤️ **Like & Comment** - Engage with posts
- 🔔 **Notifications** - Real-time updates
- 💬 **Messaging** - Direct messages between users
- 🔍 **Search** - Find users, posts, communities
- 👤 **Profiles** - Detailed user profiles with About section
- 🤝 **Connections** - Connect with other users

### Admin Features
- 📊 **Dashboard** - User statistics and analytics
- ✅ **User Verification** - Approve/reject new registrations
- 📧 **Email Management** - Send verification emails
- 🚫 **User Blocking** - Block users with reasons
- 👥 **Role Management** - Assign/change user roles

---

## 👥 User Roles

### Student
- Current students and alumni
- Can post community posts, blogs, opportunities
- Join communities and engage with content
- Access to all social features

### Teacher
- Can create communities
- Post announcements, blogs, events, reels, polls
- Mark posts as important
- Moderate their communities
- Target specific audiences (departments, courses, batches)

### Principal
- Same as teacher with higher visibility
- College-wide announcement privileges
- Enhanced moderation capabilities

### Admin
- Verify new users
- Control permissions and platform settings
- Block/unblock users
- Manage user roles
- Access to admin dashboard

---

## 🚀 Technology Stack

**Frontend:**
- React.js 18
- Tailwind CSS
- React Router v6
- Axios
- React Hot Toast
- Lucide React Icons

**Backend:**
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Express Validator
- Multer (file uploads)

**Services:**
- MongoDB Atlas (Database)
- Cloudinary (Media Storage)
- Gmail SMTP (Email Notifications)

---

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account
- Cloudinary account
- Gmail account (for email notifications)

### Step 1: Clone Repository
```bash
git clone <repository-url>
cd CollegeConnect
```

### Step 2: Install Dependencies
```bash
# Install root dependencies
npm install

# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

### Step 3: Environment Setup
Create a `.env` file in the `server` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/collegeconnect

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email Configuration (Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-character-app-password

# Admin Credentials
ADMIN_EMAIL=admin@college.com
ADMIN_PASSWORD=admin123
ADMIN_NAME=System Administrator
```

---

## ⚙️ Configuration

### MongoDB Atlas Setup
1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Add database user with read/write permissions
4. Whitelist your IP address (or use 0.0.0.0/0 for development)
5. Get connection string and update `MONGODB_URI` in `.env`

### Cloudinary Setup
1. Create account at [Cloudinary](https://cloudinary.com/)
2. Go to Dashboard
3. Copy Cloud Name, API Key, and API Secret
4. Update Cloudinary credentials in `.env`

### Gmail Email Setup
1. Enable 2-Factor Authentication on your Gmail account
2. Go to Security → 2-Step Verification → App passwords
3. Generate app password for "Mail" → "Other (CampusConnect)"
4. Copy the 16-character password
5. Update `EMAIL_USER` and `EMAIL_PASS` in `.env`

---

## 🚀 Quick Start

### Start Development Servers

**Option 1: Start Both Servers Together**
```bash
# From root directory
npm run dev
```

**Option 2: Start Servers Separately**

Terminal 1 - Backend:
```bash
cd server
npm start
```

Terminal 2 - Frontend:
```bash
cd client
npm start
```

### Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

### Default Admin Credentials
- **Email**: `admin@college.com` (or value from .env)
- **Password**: `admin123` (or value from .env)

---

## 🛡️ Admin Panel

### Accessing Admin Dashboard
1. Login with admin credentials
2. Navigate to `/admin` route
3. Access admin-only features

### Admin Features

#### Dashboard Statistics
- Total users count
- Verified users count
- Pending verification count
- Blocked users count

#### User Verification
1. Go to "Pending Verification" tab
2. Review user details:
   - Name, Email, College ID
   - Department, Course, Batch
   - Profile picture
3. Click "Approve & Send Email" to verify
4. Click "Reject & Notify" to block (with optional reason)

#### User Management
- View all users
- Search and filter users
- Change user roles
- Block/unblock users

### Creating Admin Users
Admins are auto-created on first login if credentials match `.env` file. To create additional admins:

```bash
cd server
node scripts/createAdmin.js
```

---

## 📧 Email Setup

### Gmail App Password Setup

1. **Enable 2-Factor Authentication**
   - Go to https://myaccount.google.com/
   - Security → 2-Step Verification
   - Follow setup instructions

2. **Generate App Password**
   - Security → 2-Step Verification → App passwords
   - Select "Mail" and "Other (CampusConnect)"
   - Copy 16-character password (format: xxxx xxxx xxxx xxxx)

3. **Update .env File**
   ```env
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=xxxx xxxx xxxx xxxx
   ```

4. **Restart Server**
   ```bash
   npm run server
   ```

### Email Templates

**Approval Email:**
- Welcome message
- Account details (name, email, role, department)
- Direct login link
- Professional HTML design

**Rejection Email:**
- Clear rejection notification
- Optional reason for rejection
- Contact support information

---

## 📁 Project Structure

```
CollegeConnect/
├── client/                      # React frontend
│   ├── public/
│   │   ├── index.html
│   │   ├── manifest.json       # PWA manifest
│   │   └── sw.js               # Service worker
│   ├── src/
│   │   ├── components/         # Reusable components
│   │   │   ├── Auth/          # Authentication components
│   │   │   ├── Common/        # Shared components
│   │   │   ├── Home/          # Home page components
│   │   │   ├── Layout/        # Layout components
│   │   │   ├── Posts/         # Post-related components
│   │   │   └── Profile/       # Profile components
│   │   ├── contexts/          # React contexts
│   │   │   ├── AuthContext.js
│   │   │   └── OnboardingContext.js
│   │   ├── hooks/             # Custom hooks
│   │   ├── pages/             # Page components
│   │   │   ├── Admin/         # Admin dashboard
│   │   │   ├── Auth/          # Login/Register
│   │   │   ├── Communities/   # Communities page
│   │   │   ├── Home/          # Home feed
│   │   │   ├── Messages/      # Messaging
│   │   │   ├── Notifications/ # Notifications
│   │   │   ├── Posts/         # Create post
│   │   │   ├── Profile/       # User profiles
│   │   │   └── Search/        # Search page
│   │   ├── utils/             # Utility functions
│   │   │   ├── api.js         # Axios configuration
│   │   │   └── permissions.js # RBAC utilities
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── tailwind.config.js
│
├── server/                      # Node.js backend
│   ├── config/
│   │   └── cloudinary.js       # Cloudinary config
│   ├── middleware/
│   │   ├── auth.js             # JWT authentication
│   │   └── upload.js           # File upload handling
│   ├── models/
│   │   ├── Community.js        # Community model
│   │   ├── Post.js             # Post model
│   │   └── User.js             # User model
│   ├── routes/
│   │   ├── admin.js            # Admin routes
│   │   ├── auth.js             # Authentication routes
│   │   ├── communities.js      # Community routes
│   │   ├── posts.js            # Post routes
│   │   ├── profile.js          # Profile routes
│   │   └── search.js           # Search routes
│   ├── scripts/
│   │   ├── createAdmin.js      # Create admin user
│   │   └── createTestUser.js  # Create test users
│   ├── .env                    # Environment variables
│   ├── .env.example            # Environment template
│   ├── index.js                # Server entry point
│   └── package.json
│
├── package.json                 # Root package.json
└── README.md                    # This file
```

---

## 📜 Available Scripts

### Root Directory
```bash
npm run dev          # Start both client and server
npm run client       # Start only frontend
npm run server       # Start only backend
npm run install-all  # Install all dependencies
```

### Client Directory
```bash
npm start            # Start development server
npm run build        # Build for production
npm test             # Run tests
```

### Server Directory
```bash
npm start            # Start server
npm run dev          # Start with nodemon (auto-restart)
```

---

## 🔧 Troubleshooting

### Backend Won't Start

**MongoDB Connection Error:**
```bash
# Check MongoDB URI in .env
# Verify IP whitelist in MongoDB Atlas
# Ensure network connectivity
```

**Port 5000 Already in Use:**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5000 | xargs kill -9
```

### Frontend Won't Start

**Port 3000 Already in Use:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

**Module Not Found:**
```bash
cd client
rm -rf node_modules package-lock.json
npm install
```

### App Stuck on Loading Screen
1. Ensure backend is running on port 5000
2. Clear browser cache and localStorage
3. Check browser console for errors (F12)
4. Verify API base URL in `client/src/utils/api.js`

### Email Not Sending
1. Verify Gmail app password is correct
2. Check 2-Factor Authentication is enabled
3. Remove spaces from app password in .env
4. Check server logs for email errors
5. Verify EMAIL_HOST and EMAIL_PORT settings

### Images Not Uploading
1. Verify Cloudinary credentials in .env
2. Check file size (max 10MB)
3. Ensure supported formats (jpg, png, gif, mp4)
4. Check server logs for Cloudinary errors

### User Can't Login
1. Verify user is verified (not pending)
2. Check credentials are correct
3. Ensure JWT_SECRET is set in .env
4. Clear browser cookies and localStorage

---

## 🎓 Key Features Explained

### Post Types & Permissions

| Post Type | Student | Teacher | Principal | Admin |
|-----------|---------|---------|-----------|-------|
| Community Post | ✅ | ✅ | ✅ | ✅ |
| Blog | ✅ | ✅ | ✅ | ✅ |
| Opportunity | ✅ | ✅ | ✅ | ✅ |
| Announcement | ❌ | ✅ | ✅ | ✅ |
| Event | ❌ | ✅ | ✅ | ✅ |
| Poll | ❌ | ✅ | ✅ | ✅ |
| Reel | ❌ | ✅ | ✅ | ✅ |
| Mark Important | ❌ | ✅ | ✅ | ✅ |

### Target Audience
Teachers, Principals, and Admins can target posts to specific:
- **Departments**: Computer Science, Electronics, Mechanical, etc.
- **Courses**: B.Tech, M.Tech, BCA, MCA, MBA
- **Batches**: 2021-2025, 2022-2026, etc.
- **Roles**: Students, Alumni, Teachers

### Verification Flow
1. User registers with college details
2. Status set to `pending_verification`
3. Admin reviews in admin dashboard
4. Admin approves → User receives welcome email
5. Admin rejects → User receives rejection email with reason
6. Verified users can access full platform

---

## 🚀 Production Deployment

### Environment Variables
Ensure all production values are set:
- Use strong JWT_SECRET
- Use production MongoDB cluster
- Configure proper CORS settings
- Set NODE_ENV=production

### Build Frontend
```bash
cd client
npm run build
```
