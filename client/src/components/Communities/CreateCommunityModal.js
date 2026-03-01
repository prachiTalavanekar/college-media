import React, { useState } from 'react';
import { X, Plus, Trash2, Info } from 'lucide-react';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';

const CreateCommunityModal = ({ isOpen, onClose, onCommunityCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    purpose: '',
    type: 'subject',
    isPrivate: false,
    requiresApproval: true,
    eligibility: {
      departments: [],
      courses: [],
      batches: [],
      roles: ['student']
    },
    rules: [{ title: '', description: '' }],
    academicSettings: {
      subject: '',
      semester: '',
      academicYear: '',
      allowStudentPosts: true,
      allowFileUploads: true,
      allowPolls: true,
      moderationLevel: 'medium'
    }
  });
  const [loading, setLoading] = useState(false);

  const communityTypes = [
    { value: 'department', label: 'Department', description: 'For entire department members' },
    { value: 'subject', label: 'Subject/Course', description: 'For specific subject or course' },
    { value: 'batch', label: 'Batch', description: 'For specific batch/year students' },
    { value: 'project', label: 'Project Group', description: 'For project collaboration' },
    { value: 'club', label: 'Club/Society', description: 'For clubs and societies' },
    { value: 'alumni_mentorship', label: 'Mentorship', description: 'For mentoring students' },
    { value: 'alumni_jobs', label: 'Job Opportunities', description: 'For job-related discussions' },
    { value: 'general', label: 'General', description: 'General purpose community' }
  ];

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
  
  const roles = ['student', 'alumni', 'teacher'];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  const handleArrayChange = (parent, field, value, checked) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: checked 
          ? [...prev[parent][field], value]
          : prev[parent][field].filter(item => item !== value)
      }
    }));
  };

  const addRule = () => {
    setFormData(prev => ({
      ...prev,
      rules: [...prev.rules, { title: '', description: '' }]
    }));
  };

  const removeRule = (index) => {
    setFormData(prev => ({
      ...prev,
      rules: prev.rules.filter((_, i) => i !== index)
    }));
  };

  const updateRule = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      rules: prev.rules.map((rule, i) => 
        i === index ? { ...rule, [field]: value } : rule
      )
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.description.trim()) {
      toast.error('Name and description are required');
      return;
    }

    console.log('Submitting community data:', formData); // Debug log

    setLoading(true);
    try {
      const response = await api.post('/communities', formData);
      toast.success('Community created successfully!');
      onCommunityCreated(response.data.community);
      onClose();
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        purpose: '',
        type: 'subject',
        isPrivate: false,
        requiresApproval: true,
        eligibility: {
          departments: [],
          courses: [],
          batches: [],
          roles: ['student']
        },
        rules: [{ title: '', description: '' }],
        academicSettings: {
          subject: '',
          semester: '',
          academicYear: '',
          allowStudentPosts: true,
          allowFileUploads: true,
          allowPolls: true,
          moderationLevel: 'medium'
        }
      });
    } catch (error) {
      console.error('Create community error:', error);
      console.error('Error response:', error.response?.data);
      
      if (error.response?.data?.errors) {
        console.error('Validation errors:', error.response.data.errors);
        const errorMessages = error.response.data.errors.map(err => err.msg).join(', ');
        toast.error(`Validation failed: ${errorMessages}`);
      } else {
        toast.error(error.response?.data?.message || 'Failed to create community');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Create New Community</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Community Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Data Structures & Algorithms"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Brief description of the community purpose..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Purpose (Optional)
              </label>
              <textarea
                value={formData.purpose}
                onChange={(e) => handleInputChange('purpose', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Detailed purpose and objectives..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Community Type
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {communityTypes.map(type => (
                  <label key={type.value} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      value={type.value}
                      checked={formData.type === type.value}
                      onChange={(e) => handleInputChange('type', e.target.value)}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-medium text-gray-900">{type.label}</div>
                      <div className="text-sm text-gray-500">{type.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Academic Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Academic Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={formData.academicSettings.subject}
                  onChange={(e) => handleNestedChange('academicSettings', 'subject', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Data Structures"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Semester
                </label>
                <select
                  value={formData.academicSettings.semester}
                  onChange={(e) => handleNestedChange('academicSettings', 'semester', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Semester</option>
                  {[1,2,3,4,5,6,7,8].map(sem => (
                    <option key={sem} value={sem}>Semester {sem}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Academic Year
                </label>
                <input
                  type="text"
                  value={formData.academicSettings.academicYear}
                  onChange={(e) => handleNestedChange('academicSettings', 'academicYear', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 2023-24"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Community Permissions
              </label>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.academicSettings.allowStudentPosts}
                    onChange={(e) => handleNestedChange('academicSettings', 'allowStudentPosts', e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">Allow students to create posts</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.academicSettings.allowFileUploads}
                    onChange={(e) => handleNestedChange('academicSettings', 'allowFileUploads', e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">Allow file uploads</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.academicSettings.allowPolls}
                    onChange={(e) => handleNestedChange('academicSettings', 'allowPolls', e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">Allow polls and surveys</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Moderation Level
              </label>
              <select
                value={formData.academicSettings.moderationLevel}
                onChange={(e) => handleNestedChange('academicSettings', 'moderationLevel', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="low">Low - Minimal moderation</option>
                <option value="medium">Medium - Moderate oversight</option>
                <option value="high">High - Strict moderation</option>
              </select>
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Privacy & Access</h3>
            
            <div className="space-y-3">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.isPrivate}
                  onChange={(e) => handleInputChange('isPrivate', e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">Private community (invitation only)</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.requiresApproval}
                  onChange={(e) => handleInputChange('requiresApproval', e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">Require approval for join requests</span>
              </label>
            </div>
          </div>

          {/* Eligibility */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Who Can Join</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Departments
                </label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {departments.map(dept => (
                    <label key={dept} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.eligibility.departments.includes(dept)}
                        onChange={(e) => handleArrayChange('eligibility', 'departments', dept, e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-700">{dept}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Courses
                </label>
                <div className="space-y-2">
                  {courses.map(course => (
                    <label key={course} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.eligibility.courses.includes(course)}
                        onChange={(e) => handleArrayChange('eligibility', 'courses', course, e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-700">{course}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  User Roles
                </label>
                <div className="space-y-2">
                  {roles.map(role => (
                    <label key={role} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.eligibility.roles.includes(role)}
                        onChange={(e) => handleArrayChange('eligibility', 'roles', role, e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-700 capitalize">{role}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Batches (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., 2021-2025, 2022-2026, 2023-2027"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onBlur={(e) => {
                    const batches = e.target.value.split(',').map(b => b.trim()).filter(b => b);
                    handleNestedChange('eligibility', 'batches', batches);
                  }}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Separate multiple batches with commas. Leave empty to allow all batches.
                </p>
              </div>
            </div>
          </div>

          {/* Community Rules */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Community Rules</h3>
              <button
                type="button"
                onClick={addRule}
                className="flex items-center space-x-1 text-blue-600 hover:text-blue-700"
              >
                <Plus size={16} />
                <span className="text-sm">Add Rule</span>
              </button>
            </div>
            
            <div className="space-y-3">
              {formData.rules.map((rule, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-700">Rule {index + 1}</h4>
                    {formData.rules.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRule(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={rule.title}
                      onChange={(e) => updateRule(index, 'title', e.target.value)}
                      placeholder="Rule title"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    
                    <textarea
                      value={rule.description}
                      onChange={(e) => updateRule(index, 'description', e.target.value)}
                      placeholder="Rule description"
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Creating...' : 'Create Community'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCommunityModal;