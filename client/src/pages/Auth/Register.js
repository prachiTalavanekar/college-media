import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    collegeId: '',
    contactNumber: '',
    department: '',
    course: '',
    batch: '',
    role: 'student'
  });
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const departments = [
    'Computer Science',
    'Information Technology',
    'Accounting & Finance',
    'Business and Management Studies',
    'Science',
    'Arts',
    'Commerce'
  ];

  const courses = [
    'BSc Computer Science',
    'MSc Computer Science',
    'BAF',
    'BMS',
    'BA',
    'MCom',
    'BCom',
    'BSc IT',
    'MSc IT'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Clear academic fields when role changes to teacher or principal
    if (name === 'role' && (value === 'teacher' || value === 'principal')) {
      setFormData({
        ...formData,
        [name]: value,
        department: '',
        course: '',
        batch: ''
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const result = await register(formData);
      
      if (result.success) {
        alert('Registration successful! Please wait for admin verification.');
        navigate('/login');
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
    <div className="bg-gray-50 px-4 hide-scrollbar" style={{ minHeight: '100vh', overflowY: 'auto', overflowX: 'hidden' }}>
      <div className="max-w-2xl w-full mx-auto py-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">CC</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Join CampusConnect</h1>
          <p className="text-gray-600">Create your verified college account</p>
        </div>

        {/* Registration Form */}
        <div className="bg-white rounded-2xl shadow-xl p-4 md:p-8 mb-8">
          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-3 md:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                  placeholder="Enter your full name"
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  College Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-3 md:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                  placeholder="your.email@college.edu"
                />
              </div>
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3 py-3 md:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                  placeholder="Create password"
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-3 py-3 md:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                  placeholder="Confirm password"
                />
              </div>
            </div>

            {/* College Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {/* College ID */}
              <div>
                <label htmlFor="collegeId" className="block text-sm font-medium text-gray-700 mb-2">
                  College ID / Admission Number
                </label>
                <input
                  id="collegeId"
                  name="collegeId"
                  type="text"
                  required
                  value={formData.collegeId}
                  onChange={handleChange}
                  className="w-full px-3 py-3 md:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                  placeholder="e.g., 2021CS001"
                />
              </div>

              {/* Contact Number */}
              <div>
                <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Number
                </label>
                <input
                  id="contactNumber"
                  name="contactNumber"
                  type="tel"
                  required
                  value={formData.contactNumber}
                  onChange={handleChange}
                  className="w-full px-3 py-3 md:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                  placeholder="Phone number from admission"
                />
              </div>
            </div>

            {/* Academic Information - Only for Students and Alumni */}
            {(formData.role === 'student' || formData.role === 'alumni') && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                {/* Department */}
                <div>
                  <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
                    Department
                  </label>
                  <select
                    id="department"
                    name="department"
                    required
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full px-3 py-3 md:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                {/* Course */}
                <div>
                  <label htmlFor="course" className="block text-sm font-medium text-gray-700 mb-2">
                    Course
                  </label>
                  <select
                    id="course"
                    name="course"
                    required
                    value={formData.course}
                    onChange={handleChange}
                    className="w-full px-3 py-3 md:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                  >
                    <option value="">Select Course</option>
                    {courses.map(course => (
                      <option key={course} value={course}>{course}</option>
                    ))}
                  </select>
                </div>

                {/* Batch */}
                <div>
                  <label htmlFor="batch" className="block text-sm font-medium text-gray-700 mb-2">
                    Batch / Year
                  </label>
                  <input
                    id="batch"
                    name="batch"
                    type="text"
                    required
                    value={formData.batch}
                    onChange={handleChange}
                    className="w-full px-3 py-3 md:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                    placeholder="e.g., 2021-2025"
                  />
                </div>
              </div>
            )}

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                I am a:
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { value: 'student', label: 'Current Student' },
                  { value: 'alumni', label: 'Alumni' },
                  { value: 'teacher', label: 'Teacher' },
                  { value: 'principal', label: 'Principal' }
                ].map(role => (
                  <label key={role.value} className="relative">
                    <input
                      type="radio"
                      name="role"
                      value={role.value}
                      checked={formData.role === role.value}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className={`p-3 rounded-lg border-2 cursor-pointer transition-all min-h-[44px] flex items-center justify-center ${
                      formData.role === role.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <div className="text-center">
                        <div className="text-sm font-medium">{role.label}</div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-4 md:py-3 px-4 rounded-lg transition-colors disabled:opacity-50 text-base min-h-[44px]"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link 
                to="/login" 
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
              >
                Sign in here
              </Link>
            </p>
          </div>

          {/* Verification Info */}
          <div className="mt-6 p-4 bg-amber-50 rounded-lg">
            <div className="flex items-start space-x-3">
              <div className="w-5 h-5 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="w-2 h-2 bg-amber-600 rounded-full"></div>
              </div>
              <div>
                <p className="text-sm font-medium text-amber-900 mb-1">
                  Verification Process
                </p>
                <p className="text-xs text-amber-700">
                  Your account will be verified using your College ID and contact number from admission records. 
                  This may take 24-48 hours.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;