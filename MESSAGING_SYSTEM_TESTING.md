# Messaging System - Complete Testing Guide

## System Overview

The messaging system is fully implemented with connection-based access control. Users can ONLY message other users they are connected with.

## Features Implemented

### 1. Connection-Based Access ✅
- Users must be connected before messaging
- Message button disabled until connection accepted
- API validates connection status before sending messages
- Error message shown if trying to message non-connected user

### 2. Unread Message Count ✅
- Badge shows on message icon in header
- Updates every 10 seconds automatically
- Shows actual count (1-9) or "9+" for more
- Only shows when count > 0
- Resets to 0 when messages are read

### 3. Real-Time Messaging ✅
- Messages update every 3 seconds
- Conversation list shows last message
- Unread count per conversation
- Timestamp formatting (Just now, 5m ago, etc.)

### 4. Message Features ✅
- Send text messages
- View conversation history
- Mark messages as read automatically
- Delete messages (sender only)
- Pagination support (50 messages per page)

## Testing Steps

### Test 1: Connection Requirement

1. **Login as User A**
   ```
   Email: prachi@example.com
   Password: prachi1234
   ```

2. **Search for User B (not connected)**
   - Go to Search
   - Search for "nigel"
   - Click on profile

3. **Verify Message Button is Disabled**
   - Should see grayed out "Message" button
   - Clicking shows error: "You need to be connected to send messages"

4. **Send Connection Request**
   - Click "Connect" button
   - Button changes to "Request Sent"
   - Message button still disabled

5. **Logout and Login as User B**
   ```
   Email: nigel@example.com
   Password: nigel1234
   ```

6. **Accept Connection**
   - Go to Notifications
   - See connection request from User A
   - Click notification
   - Click "Accept Request"
   - Connection count increases to 1

7. **Verify Message Button is Enabled**
   - Message button now active (white background)
   - Can click to open messaging

### Test 2: Sending Messages

1. **User B clicks "Message" button**
   - Opens messaging page
   - Shows conversation with User A
   - Empty conversation (no messages yet)

2. **User B sends first message**
   - Type: "Hi! Thanks for connecting!"
   - Press Enter or click Send
   - Message appears in conversation
   - Shows timestamp

3. **Verify Message Appears**
   - Message shows on right side (own message)
   - Blue background
   - Timestamp displayed

### Test 3: Receiving Messages

1. **Logout and Login as User A**

2. **Check Message Icon**
   - Should see red badge with "1"
   - Indicates 1 unread message

3. **Click Message Icon**
   - Opens messaging page
   - Shows conversation with User B
   - Unread count badge on conversation

4. **Open Conversation**
   - Click on User B's conversation
   - See message from User B
   - Message on left side (received message)
   - Gray background

5. **Verify Unread Count Updates**
   - Badge disappears from header
   - Conversation marked as read
   - Unread count = 0

### Test 4: Two-Way Conversation

1. **User A replies**
   - Type: "Hello! Happy to connect!"
   - Send message
   - Appears on right side

2. **Wait 3 seconds**
   - Messages auto-refresh
   - Conversation updates

3. **Switch to User B**
   - See unread badge (1)
   - Open messages
   - See User A's reply
   - Badge clears

4. **Continue conversation**
   - Send multiple messages
   - Verify real-time updates
   - Check timestamps

### Test 5: Multiple Conversations

1. **User A connects with User C**
   - Send connection request
   - User C accepts
   - Now User A has 2 connections

2. **User A messages both users**
   - Message User B: "How are you?"
   - Message User C: "Nice to meet you!"

3. **Check Conversation List**
   - Shows both conversations
   - Last message preview
   - Timestamps
   - Unread counts

4. **Verify Unread Count**
   - Header shows total unread (e.g., "2")
   - Each conversation shows individual count

### Test 6: Connection Verification

1. **Try to message non-connected user**
   - User A searches for User D (not connected)
   - Message button disabled
   - Cannot access messaging

2. **Try direct URL access**
   - Navigate to `/messages?userId=<non-connected-user-id>`
   - Should show error
   - Redirected to home
   - Toast message: "You need to be connected to message this user"

### Test 7: Unread Count Accuracy

1. **User B sends 3 messages to User A**
   - Message 1: "Hey"
   - Message 2: "Are you there?"
   - Message 3: "Let me know!"

2. **Check User A's header**
   - Badge shows "3"
   - Accurate count

3. **User A opens messages**
   - Badge clears
   - All messages marked as read

4. **User B sends another message**
   - User A's badge shows "1"
   - Updates within 10 seconds

## API Endpoints

### Messages
```
GET    /api/messages/conversations          - Get all conversations
GET    /api/messages/conversation/:userId   - Get conversation with user
POST   /api/messages/send                   - Send a message
PUT    /api/messages/:messageId/read        - Mark message as read
GET    /api/messages/unread-count           - Get unread count
DELETE /api/messages/:messageId             - Delete a message
```

### Request Examples

**Send Message:**
```json
POST /api/messages/send
{
  "recipientId": "69941d61ae9d019933cc0f22",
  "content": "Hello! How are you?"
}
```

**Response:**
```json
{
  "message": "Message sent successfully",
  "data": {
    "_id": "...",
    "sender": {...},
    "recipient": {...},
    "content": "Hello! How are you?",
    "read": false,
    "createdAt": "2026-02-17T11:00:00.000Z"
  }
}
```

**Get Unread Count:**
```json
GET /api/messages/unread-count

Response:
{
  "unreadCount": 3
}
```

## Expected Behavior

### Unread Count Badge
- ✅ Shows only when count > 0
- ✅ Updates every 10 seconds
- ✅ Shows "9+" for counts over 9
- ✅ Clears when messages are read
- ✅ Accurate across all conversations

### Message Button
- ✅ Disabled (gray) for non-connected users
- ✅ Enabled (white) for connected users
- ✅ Shows error toast if clicked when disabled
- ✅ Opens messaging page when enabled

### Messaging Page
- ✅ Shows only connected users
- ✅ Empty state when no conversations
- ✅ Conversation list with previews
- ✅ Real-time message updates (3s)
- ✅ Unread badges per conversation
- ✅ Timestamp formatting

### Security
- ✅ Connection verification on every message send
- ✅ Cannot message non-connected users
- ✅ Cannot access conversations via direct URL
- ✅ Authentication required for all endpoints
- ✅ User can only see their own messages

## Troubleshooting

### Badge Not Updating
1. Check browser console for errors
2. Verify API endpoint is accessible
3. Check network tab for `/api/messages/unread-count` calls
4. Ensure user is logged in

### Messages Not Sending
1. Verify users are connected
2. Check connection status API
3. Look for error messages in console
4. Verify server is running

### Messages Not Appearing
1. Wait 3 seconds for auto-refresh
2. Check if service worker is caching (should not be)
3. Hard refresh (Ctrl+Shift+R)
4. Check server logs

## Success Criteria

✅ Users can only message connected users
✅ Unread count shows accurately
✅ Badge updates automatically
✅ Messages send and receive in real-time
✅ Conversation list shows all chats
✅ Timestamps are formatted correctly
✅ Read status updates properly
✅ Connection verification works
✅ Error handling is graceful
✅ UI is responsive and intuitive

## Current Status

🟢 **FULLY FUNCTIONAL**

All messaging features are working:
- Connection-based access control
- Real-time messaging
- Unread count tracking
- Conversation management
- Security and validation

The system is production-ready! 🎉
