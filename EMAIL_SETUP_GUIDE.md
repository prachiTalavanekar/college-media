# Gmail Email Setup Guide for CampusConnect

## 📧 Email Configuration Setup

To enable email notifications for user verification, you need to configure Gmail with an App Password.

### Step 1: Enable 2-Factor Authentication
1. Go to your Google Account settings: https://myaccount.google.com/
2. Navigate to **Security** → **2-Step Verification**
3. Follow the steps to enable 2-factor authentication if not already enabled

### Step 2: Generate App Password
1. Go to **Security** → **2-Step Verification** → **App passwords**
2. Select **Mail** as the app and **Other** as the device
3. Enter "CampusConnect" as the device name
4. Click **Generate**
5. Copy the 16-character app password (format: xxxx xxxx xxxx xxxx)

### Step 3: Update .env File
Update your `server/.env` file with the app password:

```env
# Email Configuration (for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=prachitalavanekar29@gmail.com
EMAIL_PASS=your-16-character-app-password-here
```

**Important:** Replace `your-16-character-app-password-here` with the actual app password from Step 2.

### Step 4: Restart Server
After updating the .env file, restart your server:
```bash
npm run server
```

## 🧪 Testing Email Functionality

Once configured, test the email system:

1. **Login as Admin:**
   - Email: `prachi@admin.com`
   - Password: `prachi1234`

2. **Approve a User:**
   - Go to Admin Dashboard → Pending Verification
   - Click "Approve & Send Email" on any pending user
   - Check the user's email inbox for the verification email

3. **Check Server Logs:**
   - Look for "✅ Email sent successfully" in server console
   - If you see "📧 Email credentials not configured", update the .env file

## 📧 Email Templates

### Approval Email Features:
- Professional HTML design with CampusConnect branding
- User account details (name, email, role, department, course, batch)
- Direct login link to the platform
- Responsive design for all devices

### Rejection Email Features:
- Clear rejection notification
- Optional reason for rejection
- Contact support link
- Professional formatting

## 🔧 Troubleshooting

### Common Issues:

1. **"Invalid login" error:**
   - Make sure 2-factor authentication is enabled
   - Use App Password, not your regular Gmail password
   - Remove spaces from the app password

2. **"Connection refused" error:**
   - Check if Gmail SMTP is accessible from your network
   - Verify EMAIL_HOST and EMAIL_PORT settings

3. **Emails not received:**
   - Check spam/junk folder
   - Verify recipient email address
   - Check server logs for sending confirmation

### Email Settings Reference:
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=prachitalavanekar29@gmail.com
EMAIL_PASS=your-app-password
```

## 🚀 Production Considerations

For production deployment:
1. Use environment variables for sensitive data
2. Consider using dedicated email services (SendGrid, AWS SES)
3. Implement email rate limiting
4. Add email delivery tracking
5. Set up email bounce handling

## ✅ Verification Checklist

- [ ] 2-Factor Authentication enabled on Gmail
- [ ] App Password generated
- [ ] .env file updated with correct credentials
- [ ] Server restarted
- [ ] Test email sent successfully
- [ ] Email received in inbox (check spam folder)

Once completed, your CampusConnect admin system will send professional verification emails to users automatically!