# CampusConnect - Private Academic Social Network

A verified, college-exclusive social platform that centralizes communication between students, alumni, teachers, and administration.

## 🎯 Core Purpose

- **Centralized Communication**: Replace fragmented WhatsApp groups and notice boards
- **Verified Community**: Only verified college members can participate
- **Alumni Bridge**: Connect current students with graduated alumni
- **Education-First**: Content focused on academics, opportunities, and college life

## 👥 User Roles

### Student
- Current students and alumni
- Can post, comment, join communities
- Access to opportunities and resources

### Teacher
- Can create communities
- Post announcements, blogs, reels
- Moderate their communities

### Principal
- Same as teacher with higher visibility
- College-wide announcement privileges

### Admin
- Verify new users
- Control permissions and platform settings
- Block misuse and moderate content

## 🔐 Verification System

**Registration Fields:**
- College ID / Admission Number
- Contact number (from admission records)
- Department
- Course
- Batch / Passing Year

**Verification Flow:**
1. User registers with limited access
2. Admin receives verification request
3. Admin approves/rejects based on college records
4. Full access granted upon approval

## 🏘️ Key Features

### Communities
- Department-wise
- Course-wise
- Batch-wise
- Opportunities (jobs, internships)
- Events and clubs

### Content Types
- 📢 Announcements
- 📝 Blogs
- 🎥 Educational Reels
- 📸 Stories
- 💬 Community Posts

### Smart Filtering
- By department, course, batch
- Priority content from admin/teachers
- Alumni opportunities highlighted

## 🚀 Technology Stack

**Frontend:** React.js + Tailwind CSS (Responsive design)
**Backend:** Node.js + Express.js
**Database:** MongoDB Atlas
**Media Storage:** Cloudinary
**Authentication:** JWT with role-based access control

## 📁 Project Structure

```
CampusConnect/
├── client/          # React.js frontend
├── server/          # Node.js backend
├── package.json     # Root package with scripts
└── README.md
```

## 🛠️ Development Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account
- Cloudinary account

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd CampusConnect
```

2. **Install dependencies**
```bash
npm run install-all
```

3. **Environment Setup**
```bash
# Copy server environment file
cp server/.env.example server/.env
# Configure your MongoDB and Cloudinary credentials
```

4. **Start development servers**
```bash
npm run dev
```

This will start:
- Client: http://localhost:3000
- Server: http://localhost:5000

### Available Scripts

- `npm run dev` - Start both client and server
- `npm run client` - Start only React frontend
- `npm run server` - Start only Node.js backend
- `npm run build` - Build client for production

## 🎓 Alumni Features

- Job posting and referrals
- Mentorship opportunities
- Resource sharing
- Success stories
- Industry insights