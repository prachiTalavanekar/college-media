import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        alert('Welcome back!');
        navigate('/');
      } else {
        alert(result.message);
      }
    } catch (error) {
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-oxford-blue-50 to-tan-50 px-4 hide-scrollbar" style={{ minHeight: '100vh', overflowY: 'auto', overflowX: 'hidden' }}>
      <div className="max-w-md w-full mx-auto py-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-oxford-blue-900 to-oxford-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white font-bold text-2xl">CC</span>
          </div>
          <h1 className="text-3xl font-bold text-oxford-blue-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to your CampusConnect account</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-8 border border-oxford-blue-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-oxford-blue-900 mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-3 md:py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-oxford-blue-500 focus:border-oxford-blue-500 text-base"
                placeholder="Enter your college email"
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-oxford-blue-900 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-3 md:py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-oxford-blue-500 focus:border-oxford-blue-500 text-base"
                placeholder="Enter your password"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-oxford-blue-900 to-oxford-blue-700 hover:from-oxford-blue-800 hover:to-oxford-blue-600 text-white font-semibold py-4 md:py-3 px-4 rounded-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50 text-base min-h-[44px]"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <Link 
                to="/register" 
                className="font-semibold text-oxford-blue-600 hover:text-oxford-blue-700 transition-colors"
              >
                Register here
              </Link>
            </p>
          </div>

          {/* Info Box */}
          <div className="mt-6 p-4 bg-tan-50 rounded-lg border border-tan-200">
            <div className="flex items-start space-x-3">
              <div className="w-5 h-5 bg-tan-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="w-2 h-2 bg-tan-600 rounded-full"></div>
              </div>
              <div>
                <p className="text-sm font-semibold text-oxford-blue-900 mb-1">
                  College Verification Required
                </p>
                <p className="text-xs text-gray-700">
                  New accounts require admin verification before full access is granted.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;