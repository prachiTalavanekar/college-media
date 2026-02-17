# Integration Example: Adding RBAC to Existing Components

## Example: Updating the Sidebar Component

Let's update the existing Sidebar component to use the new RBAC system.

### Before (Current Code)
```javascript
// client/src/components/Layout/Sidebar.js
const Sidebar = () => {
  const { user, logout } = useAuth();

  const navItems = [
    { path: '/', icon: Home, label: 'Home', exact: true },
    { path: '/communities', icon: Users, label: 'Communities' },
    { path: '/create', icon: Plus, label: 'Create Post' },
    { path: '/notifications', icon: Bell, label: 'Notifications' },
    { path: '/profile', icon: User, label: 'Profile' }
  ];

  // Add admin route if user is admin
  if (user?.role === 'admin') {
    navItems.push({
      path: '/admin',
      icon: Shield,
      label: 'Admin Panel'
    });
  }
  
  // ... rest of component
};
```

### After (With RBAC)
```javascript
// client/src/components/Layout/Sidebar.js
import { usePermissions } from '../../hooks/usePermissions';
import RoleBadge from '../Common/RoleBadge';
import ProtectedAction from '../Common/ProtectedAction';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { can, badge } = usePermissions();

  const navItems = [
    { path: '/', icon: Home, label: 'Home', exact: true },
    { path: '/communities', icon: Users, label: 'Communities' },
    { path: '/notifications', icon: Bell, label: 'Notifications' },
    { path: '/profile', icon: User, label: 'Profile' }
  ];

  return (
    <aside className="desktop-sidebar">
      <div className="h-full flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">CampusConnect</h1>
              <p className="text-sm text-gray-500">Academic Network</p>
            </div>
          </div>
        </div>

        {/* User Info with Role Badge */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              {user?.profileImage ? (
                <img 
                  src={user.profileImage} 
                  alt={user.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <span className="text-blue-600 font-semibold text-lg">
                  {user?.name?.charAt(0)?.toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.name}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.department} • {user?.course}
              </p>
              {/* Use the new RoleBadge component */}
              <RoleBadge user={user} size="sm" />
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.exact}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            );
          })}
          
          {/* Conditionally show Create Post based on permission */}
          <ProtectedAction action="canCreatePosts">
            <NavLink
              to="/create"
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              <Plus size={20} />
              <span className="font-medium">Create Post</span>
            </NavLink>
          </ProtectedAction>
          
          {/* Show Opportunities for alumni */}
          <ProtectedAction action="canViewOpportunityDashboard">
            <NavLink
              to="/opportunities"
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              <Briefcase size={20} />
              <span className="font-medium">Opportunities</span>
            </NavLink>
          </ProtectedAction>
          
          {/* Show Admin Panel for admins */}
          <ProtectedAction action="canAccessAdminDashboard">
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              <Shield size={20} />
              <span className="font-medium">Admin Panel</span>
            </NavLink>
          </ProtectedAction>
          
          {/* Show Analytics for principals */}
          <ProtectedAction action="canViewPlatformAnalytics">
            <NavLink
              to="/analytics"
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              <TrendingUp size={20} />
              <span className="font-medium">Analytics</span>
            </NavLink>
          </ProtectedAction>
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-gray-200 space-y-2">
          <button className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors w-full">
            <Settings size={20} />
            <span className="font-medium">Settings</span>
          </button>
          <button 
            onClick={logout}
            className="flex items-center space-x-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors w-full"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
```

## Example: Updating a Post Component

### Before
```javascript
const PostCard = ({ post }) => {
  const { user } = useAuth();
  const isOwner = post.authorId === user?.id;
  
  return (
    <div className="post-card">
      <div className="post-content">{post.content}</div>
      {isOwner && (
        <div className="post-actions">
          <button>Edit</button>
          <button>Delete</button>
        </div>
      )}
    </div>
  );
};
```

### After (With RBAC)
```javascript
import { usePermissions } from '../../hooks/usePermissions';
import RoleBadge from '../Common/RoleBadge';
import ProtectedAction from '../Common/ProtectedAction';

const PostCard = ({ post }) => {
  const { user } = useAuth();
  const { can } = usePermissions();
  const isOwner = post.authorId === user?.id;
  
  return (
    <div className="post-card">
      {/* Author info with role badge */}
      <div className="post-header">
        <div className="flex items-center space-x-2">
          <img src={post.author.profileImage} alt={post.author.name} />
          <div>
            <p className="font-medium">{post.author.name}</p>
            <RoleBadge user={post.author} size="sm" />
          </div>
        </div>
      </div>
      
      <div className="post-content">{post.content}</div>
      
      <div className="post-actions">
        {/* Owner can always edit their own posts */}
        {isOwner && <button>Edit</button>}
        
        {/* Admins and moderators can edit any post */}
        <ProtectedAction action="canEditAnyPost">
          <button>Edit (Admin)</button>
        </ProtectedAction>
        
        {/* Owner can delete their own posts */}
        {isOwner && <button>Delete</button>}
        
        {/* Admins can delete any post */}
        <ProtectedAction action="canDeleteAnyPost">
          <button className="text-red-600">Delete (Admin)</button>
        </ProtectedAction>
        
        {/* Teachers can pin posts */}
        <ProtectedAction action="canPinPosts">
          <button>Pin Post</button>
        </ProtectedAction>
        
        {/* Teachers can highlight posts */}
        <ProtectedAction action="canHighlightPosts">
          <button>Highlight</button>
        </ProtectedAction>
      </div>
    </div>
  );
};
```

## Example: Updating Create Post Form

### Before
```javascript
const CreatePostForm = () => {
  const { user } = useAuth();
  
  return (
    <form>
      <textarea placeholder="What's on your mind?" />
      <button type="submit">Post</button>
    </form>
  );
};
```

### After (With RBAC)
```javascript
import { usePermissions } from '../../hooks/usePermissions';
import ProtectedAction from '../Common/ProtectedAction';

const CreatePostForm = () => {
  const { user } = useAuth();
  const { can } = usePermissions();
  const [postType, setPostType] = useState('regular');
  
  return (
    <form>
      {/* Post type selector based on permissions */}
      <select value={postType} onChange={(e) => setPostType(e.target.value)}>
        <option value="regular">Regular Post</option>
        
        <ProtectedAction action="canPostAnnouncement">
          <option value="announcement">Announcement</option>
        </ProtectedAction>
        
        <ProtectedAction action="canPostOpportunities">
          <option value="opportunity">Job/Internship</option>
        </ProtectedAction>
        
        <ProtectedAction action="canUploadAcademicResources">
          <option value="resource">Academic Resource</option>
        </ProtectedAction>
      </select>
      
      <textarea placeholder="What's on your mind?" />
      
      {/* Show special options for teachers */}
      <ProtectedAction action="canPinPosts">
        <label>
          <input type="checkbox" name="pinPost" />
          Pin this post
        </label>
      </ProtectedAction>
      
      <ProtectedAction action="canHighlightPosts">
        <label>
          <input type="checkbox" name="highlightPost" />
          Highlight this post
        </label>
      </ProtectedAction>
      
      <button type="submit">Post</button>
    </form>
  );
};
```

## Example: Updating User Profile

### Before
```javascript
const UserProfile = ({ profileUser }) => {
  const { user } = useAuth();
  const isOwnProfile = profileUser.id === user?.id;
  
  return (
    <div>
      <h2>{profileUser.name}</h2>
      <p>{profileUser.email}</p>
      {isOwnProfile && <p>College ID: {profileUser.collegeId}</p>}
    </div>
  );
};
```

### After (With RBAC)
```javascript
import { usePermissions } from '../../hooks/usePermissions';
import RoleBadge, { UserBadges } from '../Common/RoleBadge';
import { getVisibleProfileFields } from '../../utils/permissions';

const UserProfile = ({ profileUser }) => {
  const { user } = useAuth();
  const { can } = usePermissions();
  const isOwnProfile = profileUser.id === user?.id;
  
  // Get visible fields based on viewer's permissions
  const visibleFields = getVisibleProfileFields(profileUser, user);
  
  return (
    <div className="user-profile">
      <div className="profile-header">
        <img src={profileUser.profileImage} alt={profileUser.name} />
        <div>
          <h2>{profileUser.name}</h2>
          {/* Show all badges */}
          <UserBadges user={profileUser} size="md" />
        </div>
      </div>
      
      <div className="profile-info">
        {visibleFields.department && (
          <p>Department: {profileUser.department}</p>
        )}
        
        {visibleFields.course && (
          <p>Course: {profileUser.course}</p>
        )}
        
        {visibleFields.batch && (
          <p>Batch: {profileUser.batch}</p>
        )}
        
        {visibleFields.collegeId && (
          <p>College ID: {profileUser.collegeId}</p>
        )}
        
        {visibleFields.email && (
          <p>Email: {profileUser.email}</p>
        )}
        
        {visibleFields.contactNumber && profileUser.showContactNumber && (
          <p>Contact: {profileUser.contactNumber}</p>
        )}
        
        {visibleFields.bio && (
          <p>Bio: {profileUser.bio}</p>
        )}
        
        {visibleFields.interests && (
          <p>Interests: {profileUser.interests}</p>
        )}
        
        {visibleFields.skills && profileUser.skills?.length > 0 && (
          <div>
            <h3>Skills</h3>
            <div className="flex flex-wrap gap-2">
              {profileUser.skills.map((skill, index) => (
                <span key={index} className="badge">{skill}</span>
              ))}
            </div>
          </div>
        )}
        
        {/* Alumni-specific fields */}
        {profileUser.role === 'alumni' && (
          <>
            {visibleFields.graduationYear && (
              <p>Graduated: {profileUser.graduationYear}</p>
            )}
            {visibleFields.currentCompany && (
              <p>Company: {profileUser.currentCompany}</p>
            )}
            {visibleFields.jobTitle && (
              <p>Position: {profileUser.jobTitle}</p>
            )}
          </>
        )}
        
        {/* Student-specific fields */}
        {profileUser.role === 'student' && (
          <>
            {visibleFields.currentYear && (
              <p>Year: {profileUser.currentYear}</p>
            )}
            {visibleFields.currentSemester && (
              <p>Semester: {profileUser.currentSemester}</p>
            )}
          </>
        )}
      </div>
    </div>
  );
};
```

## Key Takeaways

1. **Import the hooks**: `usePermissions` for permission checks
2. **Use ProtectedAction**: For conditional rendering
3. **Display badges**: Use `RoleBadge` or `UserBadges`
4. **Check visibility**: Use `getVisibleProfileFields` for profile data
5. **Keep it simple**: The RBAC system is designed to be easy to use

## Testing Your Changes

After updating a component:

1. Test with different user roles
2. Verify permissions work correctly
3. Check that UI updates appropriately
4. Ensure no console errors
5. Test edge cases (no user, blocked user, etc.)

---

This integration example shows how easy it is to add RBAC to existing components without breaking functionality!
