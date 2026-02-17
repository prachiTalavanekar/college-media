import React, { useState } from 'react';
import api from '../utils/api';

const TestProfile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const testAuthMe = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Testing /auth/me endpoint...');
      const response = await api.get('/auth/me');
      console.log('Response:', response.data);
      setUserData(response.data.user);
    } catch (err) {
      console.error('Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const checkLocalStorage = () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    console.log('Token:', token);
    console.log('Cached user:', user ? JSON.parse(user) : null);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Profile Test Page</h1>
      
      <div className="space-y-4">
        <button
          onClick={checkLocalStorage}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Check LocalStorage
        </button>
        
        <button
          onClick={testAuthMe}
          disabled={loading}
          className="bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Test /auth/me'}
        </button>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            Error: {error}
          </div>
        )}
        
        {userData && (
          <div className="bg-gray-100 p-4 rounded">
            <h2 className="font-bold mb-2">User Data:</h2>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(userData, null, 2)}
            </pre>
            
            {userData.profileImage && (
              <div className="mt-4">
                <h3 className="font-bold mb-2">Profile Image:</h3>
                <img 
                  src={userData.profileImage} 
                  alt="Profile" 
                  className="w-32 h-32 rounded-full object-cover border"
                  onLoad={() => console.log('Test image loaded successfully')}
                  onError={(e) => console.error('Test image failed to load', e)}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TestProfile;