# Admin Panel - Quick Reference Card

## 🔑 Admin Credentials

**File:** `admin/.env`

```env
ADMIN_EMAIL=prachi@admin.com
ADMIN_PASSWORD=prachi1234
```

## 🌐 Access URLs

| Purpose | URL |
|---------|-----|
| Admin Login | http://localhost:3000/admin/login |
| Admin Dashboard | http://localhost:3000/admin/dashboard |
| Main App | http://localhost:3000 |
| API Base | http://localhost:5000/api |

## 📁 Important Files

| File | Purpose |
|------|---------|
| `admin/.env` | Admin credentials (NOT COMMITTED) |
| `admin/README.md` | Complete documentation |
| `admin/QUICK_START.md` | Quick setup guide |
| `admin/CHECKLIST.md` | Setup checklist |
| `admin/config/adminConfig.js` | Configuration |

## 🚀 Quick Commands

```bash
# View admin credentials
cat admin/.env

# Edit admin credentials
nano admin/.env

# Check if .env is protected
git check-ignore admin/.env

# View admin structure
tree admin

# Start development server
cd client && npm start

# Access admin panel
# Open: http://localhost:3000/admin/login
```

## 🔐 Security Checklist

- [x] `.env` in `.gitignore`
- [x] Credentials isolated
- [x] Separate JWT secret
- [ ] Change password for production
- [ ] Enable HTTPS
- [ ] Set up monitoring

## 📊 Admin Features

| Feature | Location |
|---------|----------|
| User Management | Dashboard → Users Tab |
| Approve Users | Dashboard → Pending Tab |
| Content Moderation | Dashboard → Reports Tab |
| Analytics | Dashboard → Overview Tab |
| Settings | Dashboard → Settings Tab |

## 🛠️ Common Tasks

### Change Admin Password
```bash
nano admin/.env
# Update ADMIN_PASSWORD line
# Restart server
```

### Test Admin Login
```
1. Go to http://localhost:3000/admin/login
2. Email: prachi@admin.com
3. Password: prachi1234
4. Click "Sign In"
```

### Export User Data
```
1. Login to admin panel
2. Go to Users tab
3. Apply filters (optional)
4. Click "Export Data"
5. Choose format (CSV/JSON/XLSX)
```

### Approve Pending User
```
1. Login to admin panel
2. Go to Pending tab
3. Review user details
4. Click "Approve" or "Reject"
```

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Cannot login | Check credentials in `admin/.env` |
| 404 Error | Verify URL is `/admin/login` |
| Permission denied | Check user role is 'admin' |
| .env tracked by git | Run `git rm --cached admin/.env` |

## 📞 Quick Help

```bash
# Check documentation
cat admin/README.md

# Quick start guide
cat admin/QUICK_START.md

# Setup checklist
cat admin/CHECKLIST.md

# View structure
cat admin/STRUCTURE.md
```

## ⚡ One-Liners

```bash
# Complete setup check
ls -la admin/.env && git check-ignore admin/.env && cat admin/.env | grep ADMIN_

# Quick login test
curl -X POST http://localhost:5000/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"prachi@admin.com","password":"prachi1234"}'

# View all admin files
find admin -type f -name "*.md" -o -name "*.js" -o -name ".env*"
```

## 📚 Documentation

| Document | Description |
|----------|-------------|
| `admin/README.md` | Complete documentation (15KB) |
| `admin/QUICK_START.md` | Quick setup guide (8KB) |
| `admin/CHECKLIST.md` | Setup checklist (10KB) |
| `admin/STRUCTURE.md` | Visual structure (5KB) |
| `ADMIN_FOLDER_COMPLETE.md` | Setup summary |
| `ADMIN_SETUP_SUMMARY.md` | Overview |

## 🎯 Next Steps

1. [ ] Test admin login
2. [ ] Review all features
3. [ ] Update credentials for production
4. [ ] Enable HTTPS
5. [ ] Set up monitoring

## ⚠️ Important Reminders

- ❌ Never commit `admin/.env`
- ✅ Always use strong passwords
- ✅ Enable HTTPS in production
- ✅ Monitor admin actions
- ✅ Regular security audits

---

**Quick Access:** http://localhost:3000/admin/login
**Credentials:** admin/.env
**Docs:** admin/README.md
**Status:** ✅ Ready to use
