# Role-Based Access Control (RBAC) Implementation

## Overview
CampusConnect now has a comprehensive role-based access control system with 5 distinct roles, each with specific permissions and capabilities.

## Roles

### 1. STUDENT (Current Student)
Active learners currently enrolled in the institution.

**Profile Fields:**
- Name, College ID, Department, Course
- Current Year/Semester
- Profile Photo, Bio, Interests, Skills
- Joined Communities, Saved Posts

**Can Do:**
✅ Create posts in allowed communities
✅ Comment & like posts
✅ Share posts internally
✅ Join open communities
✅ Request to join restricted communities
✅ Follow alumni & teachers
✅ Save posts
✅ Report posts
✅ View academic resources
✅ RSVP to events
✅ Apply to alumni-posted opportunities
✅ Message alumni (always allowed)
✅ Message teachers (configurable by admin)
✅ Message students (configurable by admin)

**Cannot Do:**
❌ Create communities
❌ Post official announcements
❌ Upload academic resources
❌ Approve users
❌ Edit or delete others' posts
❌ Broadcast college-wide messages
❌ Post job opportunities

---

### 2. ALUMNI (Graduated Student)
Verified graduates with extended privileges for mentorship and guidance.

**Additional Profile Fields:**
- Graduation Year
- Current Company, Job Title
- Mentor Status
- Verified Recruiter Badge

**Can Do:**
✅ Everything a student can do, plus:
✅ Post job openings/internships/referrals
✅ Upload study materials
✅ Post career guidance content
✅ Offer mentorship (if mentor flag is true)
✅ Accept/reject mentorship requests
✅ Message students directly
✅ Access alumni-only communities
✅ View opportunity dashboard

**Special Badges:**
🎯 Mentor Badge (if mentor = true)
✓ Verified Recruiter Badge (if verified_recruiter = true)

**Cannot Do:**
❌ Create official announcements
❌ Verify users
❌ Create communities (unless granted)
❌ Edit admin/teacher posts
❌ Access admin dashboards

---

### 3. TEACHER
Content authorities, moderators, and academic leaders.

**Additional Profile Fields:**
- Teacher Verified Badge
- Department Head Status

**Can Do:**
✅ Create & manage communities
✅ Post announcements (department/community level)
✅ Post blogs, events, reels
✅ Upload academic resources
✅ Pin posts
✅ Moderate comments
✅ Approve community join requests
✅ Message students & alumni
✅ Create polls
✅ Highlight important posts
✅ View community engagement stats
✅ View department analytics (if department_head = true)

**Special Badges:**
👨‍🏫 Teacher Badge
⭐ Department Head Badge (if department_head = true)

**Cannot Do:**
❌ Verify users (unless admin)
❌ Block users platform-wide
❌ Modify system permissions
❌ Delete admin posts
❌ Send college-wide announcements

---

### 4. PRINCIPAL (Elevated Teacher)
Highest visibility and authority in academic content.

**Can Do:**
✅ Everything a teacher can do, plus:
✅ College-wide announcements
✅ Featured posts (appear at top of feeds)
✅ Event approvals (final authority)
✅ Emergency notifications
✅ Platform usage analytics
✅ Send emergency notifications
✅ View all department analytics

**Special Badge:**
👔 Principal Badge

**Cannot Do:**
❌ Verify users (admin only)
❌ Block users platform-wide (admin only)
❌ Modify system permissions (admin only)
❌ Access admin dashboard

---

### 5. ADMIN (Super User)
System integrity and security management.

**Can Do:**
✅ Verify users
✅ Change user roles
✅ Block or suspend users
✅ Approve or remove content
✅ Handle reports
✅ Enable or disable features
✅ Control messaging rules
✅ Access logs and audit trails
✅ View all analytics
✅ Manage all communities
✅ Delete/edit any post
✅ Broadcast messages

**Special Badge:**
⚙️ Admin Badge

**Note:** Admins do not participate socially (cannot create posts, comment, or like).

---

## Implementation Files

### Backend
1. **`server/models/User.js`**
   - Enhanced user schema with all role-specific fields
   - `getPermissions()` method returns role-based permissions

2. **`server/middleware/auth.js`**
   - `auth` - Basic authentication
   - `requireVerified` - Requires verified status
   - `requireRole(roles)` - Checks specific roles
   - `canCreateCommunity` - Community creation check
   - `canPostAnnouncement` - Announcement posting check
   - `canPostOpportunity` - Opportunity posting check
   - `canModerate` - Moderation check
   - `canUploadResources` - Resource upload check
   - `canManageCommunity` - Community management check
   - `requireAdmin` - Admin-only access
   - `canSendCollegeWideAnnouncement` - College-wide announcement check

### Frontend
1. **`client/src/utils/permissions.js`**
   - `getUserPermissions(user)` - Returns all permissions for a user
   - `canUserPerform(user, action)` - Checks specific permission
   - `getRoleBadge(user)` - Returns badge configuration
   - `getVisibleProfileFields(profileUser, viewerUser)` - Returns visible fields

2. **`client/src/hooks/usePermissions.js`**
   - React hook for easy permission checking
   - `can(action)` - Check if user can perform action
   - `isRole(role)` - Check if user has specific role
   - `hasAnyRole(roles)` - Check if user has any of the roles

3. **`client/src/components/Common/ProtectedAction.js`**
   - `<ProtectedAction action="...">` - Conditional rendering by permission
   - `<ProtectedRole roles="...">` - Conditional rendering by role
   - `withPermission(Component, action)` - HOC for permission check
   - `withRole(Component, roles)` - HOC for role check

4. **`client/src/components/Common/RoleBadge.js`**
   - `<RoleBadge user={user} />` - Display role badge
   - `<UserBadges user={user} />` - Display all badges (role + special)

---

## Usage Examples

### Backend Route Protection
```javascript
const { auth, requireVerified, canPostAnnouncement } = require('../middleware/auth');

// Only verified teachers, principals, and admins can post announcements
router.post('/announcements', auth, requireVerified, canPostAnnouncement, createAnnouncement);
```

### Frontend Permission Check
```javascript
import { usePermissions } from '../hooks/usePermissions';

function CreatePostButton() {
  const { can } = usePermissions();
  
  if (!can('canCreatePosts')) {
    return null;
  }
  
  return <button>Create Post</button>;
}
```

### Conditional Rendering
```javascript
import ProtectedAction from '../components/Common/ProtectedAction';

function PostActions() {
  return (
    <div>
      <ProtectedAction action="canEditOthersPosts">
        <button>Edit</button>
      </ProtectedAction>
      
      <ProtectedAction action="canDeleteOthersPosts">
        <button>Delete</button>
      </ProtectedAction>
    </div>
  );
}
```

### Role-Based Rendering
```javascript
import { ProtectedRole } from '../components/Common/ProtectedAction';

function AdminPanel() {
  return (
    <ProtectedRole roles={['admin', 'principal']}>
      <div>Admin Dashboard Content</div>
    </ProtectedRole>
  );
}
```

### Display Role Badge
```javascript
import RoleBadge, { UserBadges } from '../components/Common/RoleBadge';

function UserProfile({ user }) {
  return (
    <div>
      <h2>{user.name}</h2>
      <RoleBadge user={user} size="md" />
      {/* Or show all badges */}
      <UserBadges user={user} size="sm" />
    </div>
  );
}
```

---

## Database Fields

### User Model Fields
```javascript
{
  // Basic
  name, email, password, collegeId, contactNumber,
  department, course, batch,
  
  // Role & Status
  role: 'student' | 'alumni' | 'teacher' | 'principal' | 'admin',
  verificationStatus: 'pending_verification' | 'verified' | 'blocked',
  
  // Profile
  profileImage, bio, interests, skills: [],
  
  // Student Specific
  currentYear, currentSemester,
  
  // Alumni Specific
  graduationYear, currentCompany, jobTitle,
  alumni: Boolean,
  mentor: Boolean,
  verified_recruiter: Boolean,
  
  // Teacher Specific
  teacher_verified: Boolean,
  department_head: Boolean,
  
  // Privacy
  profileVisibility: 'public' | 'college_only' | 'private',
  showContactNumber: Boolean
}
```

---

## Migration Notes

### Existing Users
All existing users will continue to work. New fields have default values:
- `alumni: false`
- `mentor: false`
- `verified_recruiter: false`
- `teacher_verified: false`
- `department_head: false`
- `interests: ''`
- `skills: []`

### Backward Compatibility
✅ All existing features continue to work
✅ No breaking changes to existing APIs
✅ New permissions are additive, not restrictive
✅ Existing middleware functions remain unchanged

---

## Testing Checklist

### Student Role
- [ ] Can create posts in communities
- [ ] Cannot create communities
- [ ] Cannot post announcements
- [ ] Can message alumni
- [ ] Can apply to opportunities

### Alumni Role
- [ ] Can post opportunities
- [ ] Can upload study materials
- [ ] Mentor badge shows when mentor = true
- [ ] Can message students

### Teacher Role
- [ ] Can create communities
- [ ] Can post announcements
- [ ] Can moderate comments
- [ ] Can pin posts
- [ ] Department head badge shows when department_head = true

### Principal Role
- [ ] Can send college-wide announcements
- [ ] Can create featured posts
- [ ] Can view platform analytics

### Admin Role
- [ ] Can verify users
- [ ] Can change roles
- [ ] Can block users
- [ ] Can access admin dashboard
- [ ] Cannot create posts (social participation disabled)

---

## Security Considerations

1. **Token-based Authentication**: All requests require valid JWT token
2. **Role Verification**: Middleware checks role on every protected route
3. **Permission Caching**: Frontend caches permissions for performance
4. **Audit Trail**: Admin actions should be logged (implement separately)
5. **Rate Limiting**: Consider adding rate limits for sensitive actions

---

## Future Enhancements

1. **Custom Permissions**: Allow admins to create custom permission sets
2. **Temporary Roles**: Time-limited role assignments
3. **Role Hierarchy**: Automatic permission inheritance
4. **Permission Groups**: Group permissions for easier management
5. **Activity Logs**: Track all permission-based actions

---

## Support

For questions or issues with the RBAC system:
1. Check this documentation first
2. Review the implementation files
3. Test with different user roles
4. Check browser console for permission errors

---

**Status**: ✅ Fully Implemented
**Version**: 1.0
**Last Updated**: Current Session
