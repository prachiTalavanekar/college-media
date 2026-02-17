import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const cachedUser = localStorage.getItem('user');
      
      console.log('=== AuthContext initialization ===');
      console.log('Token exists:', !!token);
      console.log('Cached user exists:', !!cachedUser);
      if (cachedUser) {
        const parsed = JSON.parse(cachedUser);
        console.log('Cached user:', parsed.name, '(', parsed.role, ')');
      }
      
      if (token) {
        try {
          console.log('Fetching fresh user data from server...');
          const response = await api.get('/auth/me');
          const freshUser = response.data.user;
          
          console.log('Fresh user from server:', freshUser.name, '(', freshUser.role, ')');
          console.log('Fresh user ID:', freshUser.id);
          
          // Check if the fresh user matches the cached user
          if (cachedUser) {
            const cached = JSON.parse(cachedUser);
            if (cached.id !== freshUser.id) {
              console.warn('⚠️ TOKEN MISMATCH! Cached user:', cached.name, 'but token is for:', freshUser.name);
              console.warn('⚠️ Clearing invalid cache and using token user');
            }
          }
          
          console.log('Setting user to:', freshUser.name);
          setUser(freshUser);
          localStorage.setItem('user', JSON.stringify(freshUser));
          
        } catch (error) {
          console.error('Auth check failed:', error.message);
          console.log('Clearing invalid token and user data');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      console.log('=== AuthContext initialization complete ===');
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      // FORCE complete logout first - clear everything
      console.log('=== Forcing complete logout before login ===');
      localStorage.clear(); // Clear ALL localStorage
      sessionStorage.clear(); // Clear ALL sessionStorage
      setUser(null);
      
      // Small delay to ensure storage is cleared
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log('=== Starting fresh login ===');
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      
      console.log('=== Login Success ===');
      console.log('User data from login:', user);
      console.log('User ID:', user.id);
      console.log('User name:', user.name);
      console.log('User role:', user.role);
      console.log('Token (first 20 chars):', token.substring(0, 20) + '...');
      console.log('===================');
      
      // Set new token and user data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      
      // Verify token was saved correctly
      const savedToken = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      console.log('=== Verification ===');
      console.log('Token saved:', savedToken === token);
      console.log('User saved:', savedUser === JSON.stringify(user));
      console.log('===================');
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return { 
        success: true, 
        message: response.data.message 
      };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateUser = async () => {
    try {
      console.log('Updating user data...');
      // Clear cached user data first
      localStorage.removeItem('user');
      const response = await api.get('/auth/me');
      const updatedUser = response.data.user;
      console.log('Received updated user data:', {
        name: updatedUser.name,
        profileImage: updatedUser.profileImage
      });
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  };

  const setUserData = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    setUserData
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};