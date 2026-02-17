# CampusConnect Admin Panel

This folder contains all admin-related files and configurations for the CampusConnect platform.

## Structure

```
admin/
├── .env                    # Admin environment variables (DO NOT COMMIT)
├── .env.example           # Example environment file
├── README.md              # This file
├── pages/                 # Admin page components
│   ├── AdminLogin.js      # Admin login page
│   └── AdminDashboard.js  # Main admin dashboard
├── components/            # Admin-specific components
│   └── AdminLayout.js     # Admin layout wrapper
├── routes/                # Server-side admin routes
│   └── admin.js           # Admin API endpoints
└── config/                # Admin configuration files
    └── adminConfig.js     # Admin panel configuration
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

### Required Variables:
- `ADMIN_EMAIL` - Admin login email
- `ADMIN_PASSWORD` - Admin login password
- `ADMIN_JWT_SECRET` - JWT secret for admin sessions
- `API_BASE_URL` - Backend API URL
- `CLIENT_URL` - Frontend client URL

## Admin Credentials

Default admin credentials (change in production):
- Email: `prachi@admin.com`
- Password: `prachi1234`

**⚠️ IMPORTANT:** Change these credentials in production!

## Features

### User Management
- View all registered users
- Approve/reject pending registrations
- Block/unblock users
- Update user roles
- Export user data

### Content Moderation
- Review reported posts
- Approve or delete flagged content
- Monitor community activity

### Analytics
- User statistics and growth
- Department distribution
- Role-based analytics
- Activity trends

### System Settings
- Configure system preferences
- Manage email notifications
- Bulk actions
- System health monitoring

## Security

- Admin routes are protected with role-based authentication
- All admin actions are logged
- Rate limiting enabled
- Session timeout: 24 hours
- Separate JWT secret from main app

## API Endpoints

All admin endpoints are prefixed with `/api/admin/`

### Authentication
- `POST /api/admin/auth/login` - Admin login

### Users
- `GET /api/admin/users` - Get all users
- `GET /api/admin/users/pending` - Get pending users
- `POST /api/admin/users/:id/verify` - Verify user
- `POST /api/admin/users/:id/block` - Block user
- `POST /api/admin/users/:id/unblock` - Unblock user
- `PUT /api/admin/users/:id/role` - Update user role

### Posts
- `GET /api/admin/posts/reported` - Get reported posts
- `POST /api/admin/posts/:id/approve` - Approve post
- `DELETE /api/admin/posts/:id` - Delete post

### Statistics
- `GET /api/admin/stats` - Get dashboard statistics

## Development

### Running Admin Panel

The admin panel is integrated with the main app:

```bash
# Start the main app (includes admin)
cd client
npm start
```

Access admin panel at: `http://localhost:3000/admin/login`

### Testing Admin Features

1. Login with admin credentials
2. Navigate to different tabs
3. Test user approval/rejection
4. Test content moderation
5. Check analytics

## Production Deployment

1. Update `.env` with production values
2. Change default admin credentials
3. Enable HTTPS
4. Configure proper CORS
5. Set up monitoring
6. Enable audit logging

## Troubleshooting

### Cannot login as admin
- Check credentials in `.env`
- Verify user role is 'admin' in database
- Check JWT_SECRET matches server

### API errors
- Verify API_BASE_URL is correct
- Check server is running
- Review server logs

### Email notifications not working
- Check EMAIL_USER and EMAIL_PASS in server/.env
- Verify SMTP settings
- Check email service status

## Support

For issues or questions:
- Check server logs
- Review browser console
- Contact system administrator
