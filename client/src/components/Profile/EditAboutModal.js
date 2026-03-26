import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save, Briefcase, GraduationCap, Award, Code, Link as LinkIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../utils/api';
import StudentAboutForm from './StudentAboutForm';
import TeacherAboutForm from './TeacherAboutForm';
import AlumniAboutForm from './AlumniAboutForm';

const EditAboutModal = ({ isOpen, onClose, userData, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    bio: '',
    achievements: [],
    skills: [],
    studentData: {
      projects: [],
      linkedIn: '',
      github: '',
      portfolio: ''
    },
    teacherData: {
      teachingExperience: [],
      researchWork: [],
      publications: [],
      specializations: []
    },
    alumniData: {
      workExperience: [],
      currentPosition: '',
      currentCompany: '',
      industry: '',
      linkedIn: '',
      expertise: []
    }
  });

  useEffect(() => {
    if (userData && isOpen) {
      setFormData({
        bio: userData.about?.bio || '',
        achievements: userData.about?.achievements || [],
        skills: userData.skills || [],
        studentData: userData.about?.student || {
          projects: [],
          linkedIn: '',
          github: '',
          portfolio: ''
        },
        teacherData: userData.about?.teacher || {
          teachingExperience: [],
          researchWork: [],
          publications: [],
          specializations: []
        },
        alumniData: userData.about?.alumni || {
          workExperience: [],
          currentPosition: '',
          currentCompany: '',
          industry: '',
          linkedIn: '',
          expertise: []
        }
      });
    }
  }, [userData, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.put('/profile/about', formData);
      toast.success('About section updated successfully!');
      onUpdate(response.data);
      onClose();
    } catch (error) {
      console.error('Error updating about section:', error);
      toast.error(error.response?.data?.message || 'Failed to update about section');
    } finally {
      setLoading(false);
    }
  };

  // Achievement handlers
  const addAchievement = () => {
    setFormData(prev => ({
      ...prev,
      achievements: [...prev.achievements, { title: '', description: '', date: '' }]
    }));
  };

  const updateAchievement = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      achievements: prev.achievements.map((ach, i) => 
        i === index ? { ...ach, [field]: value } : ach
      )
    }));
  };

  const removeAchievement = (index) => {
    setFormData(prev => ({
      ...prev,
      achievements: prev.achievements.filter((_, i) => i !== index)
    }));
  };

  // Skills handlers
  const [skillInput, setSkillInput] = useState('');

  const addSkill = () => {
    if (skillInput.trim()) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }));
      setSkillInput('');
    }
  };

  const removeSkill = (index) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-gray-900">Edit About Section</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Bio Section */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Bio / About Me
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-oxford-blue-500 resize-none"
              rows={4}
              maxLength={1000}
              placeholder="Tell us about yourself..."
            />
            <div className="text-xs text-gray-500 mt-1">
              {formData.bio.length} / 1000 characters
            </div>
          </div>

          {/* Achievements Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Award size={18} className="text-oxford-blue-600" />
                Achievements
              </label>
              <button
                type="button"
                onClick={addAchievement}
                className="flex items-center gap-2 text-oxford-blue-600 hover:text-oxford-blue-700 text-sm font-semibold"
              >
                <Plus size={16} />
                Add Achievement
              </button>
            </div>
            <div className="space-y-3">
              {formData.achievements.map((achievement, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-start justify-between mb-3">
                    <input
                      type="text"
                      value={achievement.title}
                      onChange={(e) => updateAchievement(index, 'title', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-oxford-blue-500"
                      placeholder="Achievement title"
                    />
                    <button
                      type="button"
                      onClick={() => removeAchievement(index)}
                      className="ml-2 p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <textarea
                    value={achievement.description}
                    onChange={(e) => updateAchievement(index, 'description', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-oxford-blue-500 resize-none"
                    rows={2}
                    placeholder="Description"
                  />
                  <input
                    type="date"
                    value={achievement.date ? new Date(achievement.date).toISOString().split('T')[0] : ''}
                    onChange={(e) => updateAchievement(index, 'date', e.target.value)}
                    className="mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-oxford-blue-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Skills Section */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Code size={18} className="text-oxford-blue-600" />
              Skills
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-oxford-blue-500"
                placeholder="Add a skill (e.g., Python, Java, React)"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addSkill();
                  }
                }}
              />
              <button
                type="button"
                onClick={addSkill}
                className="px-4 py-2 bg-oxford-blue-600 text-white rounded-xl hover:bg-oxford-blue-700 transition-colors font-semibold"
              >
                Add
              </button>
            </div>
            {formData.skills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-oxford-blue-100 text-oxford-blue-700 rounded-full text-sm font-semibold flex items-center gap-2"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(index)}
                      className="hover:text-oxford-blue-900 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}
            {formData.skills.length === 0 && (
              <p className="text-sm text-gray-500 italic">No skills added yet. Add your skills above.</p>
            )}
          </div>

          {/* Role-specific sections */}
          {userData?.role === 'student' && (
            <StudentAboutForm formData={formData} setFormData={setFormData} />
          )}
          
          {userData?.role === 'teacher' && (
            <TeacherAboutForm formData={formData} setFormData={setFormData} />
          )}
          
          {userData?.role === 'alumni' && (
            <AlumniAboutForm formData={formData} setFormData={setFormData} />
          )}
          
          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3 -mx-6 -mb-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-oxford-blue-600 text-white rounded-xl hover:bg-oxford-blue-700 font-semibold transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAboutModal;
