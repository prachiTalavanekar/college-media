import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const FixProfile = () => {
  const { user, setUserData } = useAuth();
  const [message, setMessage] = useState('');

  const fixProfileImage = () => {
    try {
      // Get the latest profile image URL from our database check
      const latestProfileImageUrl = 'https://res.cloudinary.com/dyzfa7ovn/image/upload/v1770470608/collegeconnect/profiles/y2tbrb8ieirswsyi8709.png';
      
      // Update user context with the correct profile image
      const updatedUser = {
        ...user,
        profileImage: latestProfileImageUrl,
        profileImagePublicId: 'collegeconnect/profiles/y2tbrb8ieirswsyi8709'
      };
      
      setUserData(updatedUser);
      setMessage('Profile image updated successfully! Check your profile page.');
      
      console.log('Profile image fixed:', latestProfileImageUrl);
    } catch (error) {
      console.error('Error fixing profile image:', error);
      setMessage('Error fixing profile image: ' + error.message);
    }
  };

  const checkCurrentData = () => {
    console.log('Current user from context:', user);
    console.log('Current user from localStorage:', JSON.parse(localStorage.getItem('user') || '{}'));
    setMessage('Check console for current user data');
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-4">Fix Profile Image</h2>
      
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold mb-2">Current Profile Image:</h3>
          {user?.profileImage ? (
            <img 
              src={user.profileImage} 
              alt="Current Profile" 
              className="w-20 h-20 rounded-full object-cover border"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-2xl">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          )}
        </div>
        
        <button
          onClick={fixProfileImage}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        >
          Fix Profile Image
        </button>
        
        <button
          onClick={checkCurrentData}
          className="w-full bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
        >
          Check Current Data
        </button>
        
        {message && (
          <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default FixProfile;