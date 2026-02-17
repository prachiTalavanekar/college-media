# CampusConnect - Quick Start Guide

## Prerequisites
- Node.js installed
- MongoDB running locally on port 27017
- Two terminal windows

## Starting the Application

### Terminal 1 - Backend Server
```bash
cd server
npm start
```
Expected output:
```
🚀 Server running on port 5000
📱 Environment: development
✅ Connected to MongoDB
```

### Terminal 2 - Frontend Server
```bash
cd client
npm start
```
Expected output:
```
Compiled successfully!
Local: http://localhost:3000
```

## Access the Application
Open your browser and navigate to: **http://localhost:3000**

## Default Admin Credentials
- Email: `prachi@admin.com`
- Password: `prachi1234`

## Troubleshooting

### Backend won't start
- Check if MongoDB is running: `netstat -ano | findstr :27017`
- Check if port 5000 is available: `netstat -ano | findstr :5000`
- Verify `.env` file exists in `server/` directory

### Frontend won't start
- Check if port 3000 is available: `netstat -ano | findstr :3000`
- Clear node_modules and reinstall: `npm install`

### App stuck on loading screen
- Ensure backend is running on port 5000
- Clear browser cache and localStorage
- Check browser console for errors (F12)

### MongoDB connection error
- Start MongoDB service
- Verify connection string in `server/.env`
- Check if IP is whitelisted (for MongoDB Atlas)

## Development Workflow

1. Start MongoDB (if not already running)
2. Start backend server (Terminal 1)
3. Start frontend server (Terminal 2)
4. Make changes to code
5. Frontend hot-reloads automatically
6. Backend requires restart for changes

## Stopping the Application

Press `Ctrl+C` in both terminal windows to stop the servers.
