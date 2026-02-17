# Admin Panel - Quick Start Guide

## 🚀 Getting Started in 3 Steps

### Step 1: Configure Environment
```bash
cd admin
cp .env.example .env
```

Edit `admin/.env` with your credentials:
```env
ADMIN_EMAIL=your-admin@email.com
ADMIN_PASSWORD=your-secure-password
```

### Step 2: Start the Application
```bash
# From project root
cd client
npm start
```

### Step 3: Access Admin Panel
```
URL: http://localhost:3000/admin/login

Default Credentials:
Email: prachi@admin.com
Password: prachi1234
```

## 📁 Admin Folder Structure

```
admin/
├── .env                    # Your admin credentials (NEVER COMMIT)
├── .env.example           # Template for credentials
├── README.md              # Full documentation
├── QUICK_START.md         # This file
├── config/
│   └── adminConfig.js     # Configuration settings
├── pages/
│   ├── AdminLogin.js      # Login page
│   └── AdminDashboard.js  # Dashboard (to be added)
├── components/
│   └── AdminLayout.js     # Layout wrapper (to be added)
└── routes/
    └── admin.js           # API routes (to be added)
```

## 🔑 Admin Credentials Location

Your admin credentials are stored in:
- **File:** `admin/.env`
- **Status:** ✅ In .gitignore (safe from commits)
- **Format:**
  ```env
  ADMIN_EMAIL=prachi@admin.com
  ADMIN_PASSWORD=prachi1234
  ```

## 🎯 What You Can Do

### User Management
- ✅ View all registered users
- ✅ Approve pending registrations
- ✅ Block/unblock users
- ✅ Update user roles
- ✅ Export user data

### Content Moderation
- ✅ Review reported posts
- ✅ Approve or delete content
- ✅ Monitor community activity

### Analytics
- ✅ View user statistics
- ✅ Department distribution
- ✅ Activity trends
- ✅ Growth metrics

### System Settings
- ✅ Configure preferences
- ✅ Manage notifications
- ✅ Bulk actions
- ✅ System health

## 🔒 Security Notes

1. **Never commit `.env` file** - It's in .gitignore
2. **Change default password** - Use strong passwords in production
3. **Use HTTPS in production** - Secure your admin panel
4. **Enable rate limiting** - Configured in adminConfig.js
5. **Monitor admin actions** - All actions are logged

## 🛠️ Configuration

Edit `admin/config/adminConfig.js` to customize:
- Session timeout
- Pagination settings
- Feature flags
- Theme colors
- Email settings

## 📊 Admin Dashboard Tabs

1. **Overview** - Statistics and quick actions
2. **Users** - Manage all users with filters
3. **Pending** - Approve/reject new registrations
4. **Reports** - Review flagged content
5. **Settings** - System configuration

## 🐛 Troubleshooting

### Cannot login?
- Check credentials in `admin/.env`
- Verify admin user exists in database
- Check server is running

### 404 Error?
- Ensure you're at `/admin/login`
- Check client app is running
- Verify routes are configured

### Permission denied?
- Verify user role is 'admin' in database
- Check JWT token is valid
- Clear browser cache and try again

## 📝 Common Tasks

### Change Admin Password
1. Edit `admin/.env`
2. Update `ADMIN_PASSWORD`
3. Restart server
4. Login with new password

### Add New Admin
1. Use existing admin account
2. Go to Users tab
3. Find user and update role to 'admin'

### Export User Data
1. Go to Users tab
2. Apply filters if needed
3. Click "Export Data" button
4. Choose format (CSV/JSON/XLSX)

## 🔗 Important URLs

- **Admin Login:** http://localhost:3000/admin/login
- **Admin Dashboard:** http://localhost:3000/admin/dashboard
- **Main App:** http://localhost:3000
- **API Docs:** http://localhost:5000/api

## 📚 More Information

For detailed documentation, see:
- `admin/README.md` - Complete admin documentation
- `ADMIN_FOLDER_SETUP_COMPLETE.md` - Setup details
- `server/routes/admin.js` - API endpoints

## ⚡ Quick Commands

```bash
# View admin credentials
cat admin/.env

# Edit admin credentials
nano admin/.env

# Check if admin folder is in git
git status admin/

# Start development server
cd client && npm start

# Check server logs
cd server && npm run dev
```

## 🎉 You're Ready!

Your admin panel is now set up with:
- ✅ Separate admin folder
- ✅ Isolated credentials in .env
- ✅ Complete configuration
- ✅ Security best practices
- ✅ Full documentation

**Next:** Login and start managing your platform!

---

**Need Help?** Check `admin/README.md` for detailed documentation.
