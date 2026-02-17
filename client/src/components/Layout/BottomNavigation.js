import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Users, Plus, Bell, User, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const BottomNavigation = () => {
  const { user } = useAuth();
  
  // Admin users only see Admin Panel
  if (user?.role === 'admin') {
    return (
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 md:hidden z-50 shadow-lg">
        <div className="flex justify-center items-center max-w-md mx-auto px-2 py-2">
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `flex flex-col items-center py-2 px-6 transition-all ${
                isActive ? 'text-blue-600' : 'text-gray-500'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Shield 
                  size={24} 
                  strokeWidth={isActive ? 2.5 : 2}
                  className={isActive ? 'text-blue-600' : 'text-gray-500'}
                />
                <span className={`text-xs font-semibold mt-1 ${
                  isActive ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  Admin Panel
                </span>
              </>
            )}
          </NavLink>
        </div>
      </nav>
    );
  }
  
  const navItems = [
    {
      path: '/',
      icon: Home,
      label: 'Home',
      exact: true
    },
    {
      path: '/communities',
      icon: Users,
      label: 'Communities'
    },
    {
      path: '/create',
      icon: Plus,
      label: 'Create',
      isSpecial: true
    },
    {
      path: '/notifications',
      icon: Bell,
      label: 'Notifications'
    },
    {
      path: '/profile',
      icon: User,
      label: 'Profile'
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 md:hidden z-50 shadow-lg">
      <div className="flex justify-around items-center max-w-md mx-auto px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          
          if (item.isSpecial) {
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className="flex flex-col items-center"
              >
                <div className="w-14 h-14 -mt-8 bg-gradient-to-br from-blue-600 to-blue-500 rounded-2xl shadow-lg shadow-blue-200 flex items-center justify-center hover:shadow-xl transition-shadow">
                  <Icon size={28} className="text-white" strokeWidth={2.5} />
                </div>
                <span className="text-xs font-semibold text-gray-600 mt-1">
                  {item.label}
                </span>
              </NavLink>
            );
          }
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              className={({ isActive }) =>
                `flex flex-col items-center py-2 px-3 transition-all ${
                  isActive ? 'text-blue-600' : 'text-gray-500'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon 
                    size={24} 
                    strokeWidth={isActive ? 2.5 : 2}
                    className={isActive ? 'text-blue-600' : 'text-gray-500'}
                  />
                  <span className={`text-xs font-semibold mt-1 ${
                    isActive ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;
