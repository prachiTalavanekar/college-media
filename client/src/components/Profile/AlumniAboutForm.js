import React from 'react';
import { Plus, Trash2, Briefcase, Building2, Linkedin, Award } from 'lucide-react';

const AlumniAboutForm = ({ formData, setFormData }) => {
  // Work Experience handlers
  const addWorkExperience = () => {
    setFormData(prev => ({
      ...prev,
      alumniData: {
        ...prev.alumniData,
        workExperience: [
          ...prev.alumniData.workExperience,
          { company: '', position: '', location: '', startDate: '', endDate: '', current: false, description: '' }
        ]
      }
    }));
  };

  const updateWorkExperience = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      alumniData: {
        ...prev.alumniData,
        workExperience: prev.alumniData.workExperience.map((exp, i) =>
          i === index ? { ...exp, [field]: value } : exp
        )
      }
    }));
  };

  const removeWorkExperience = (index) => {
    setFormData(prev => ({
      ...prev,
      alumniData: {
        ...prev.alumniData,
        workExperience: prev.alumniData.workExperience.filter((_, i) => i !== index)
      }
    }));
  };

  // Expertise handlers
  const addExpertise = () => {
    const expertiseInput = document.getElementById('expertiseInput');
    if (expertiseInput && expertiseInput.value.trim()) {
      setFormData(prev => ({
        ...prev,
        alumniData: {
          ...prev.alumniData,
          expertise: [...prev.alumniData.expertise, expertiseInput.value.trim()]
        }
      }));
      expertiseInput.value = '';
    }
  };

  const removeExpertise = (index) => {
    setFormData(prev => ({
      ...prev,
      alumniData: {
        ...prev.alumniData,
        expertise: prev.alumniData.expertise.filter((_, i) => i !== index)
      }
    }));
  };

  return (
    <div className="space-y-6">
      {/* Current Position & Company */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <Briefcase size={16} className="text-oxford-blue-600" />
            Current Position
          </label>
          <input
            type="text"
            value={formData.alumniData.currentPosition}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              alumniData: { ...prev.alumniData, currentPosition: e.target.value }
            }))}
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-oxford-blue-500"
            placeholder="e.g., Senior Software Engineer"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <Building2 size={16} className="text-oxford-blue-600" />
            Current Company
          </label>
          <input
            type="text"
            value={formData.alumniData.currentCompany}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              alumniData: { ...prev.alumniData, currentCompany: e.target.value }
            }))}
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-oxford-blue-500"
            placeholder="e.g., Google"
          />
        </div>
      </div>

      {/* Industry */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Industry
        </label>
        <input
          type="text"
          value={formData.alumniData.industry}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            alumniData: { ...prev.alumniData, industry: e.target.value }
          }))}
          className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-oxford-blue-500"
          placeholder="e.g., Technology, Finance, Healthcare"
        />
      </div>

      {/* Work Experience */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Briefcase size={18} className="text-oxford-blue-600" />
            Work Experience
          </label>
          <button
            type="button"
            onClick={addWorkExperience}
            className="flex items-center gap-2 text-oxford-blue-600 hover:text-oxford-blue-700 text-sm font-semibold"
          >
            <Plus size={16} />
            Add Experience
          </button>
        </div>
        <div className="space-y-4">
          {formData.alumniData.workExperience.map((exp, index) => (
            <div key={index} className="p-4 bg-oxford-blue-50 rounded-xl border-2 border-oxford-blue-200">
              <div className="flex items-start justify-between mb-3">
                <input
                  type="text"
                  value={exp.company}
                  onChange={(e) => updateWorkExperience(index, 'company', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-oxford-blue-500"
                  placeholder="Company name"
                />
                <button
                  type="button"
                  onClick={() => removeWorkExperience(index)}
                  className="ml-2 p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <input
                  type="text"
                  value={exp.position}
                  onChange={(e) => updateWorkExperience(index, 'position', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-oxford-blue-500"
                  placeholder="Position"
                />
                <input
                  type="text"
                  value={exp.location}
                  onChange={(e) => updateWorkExperience(index, 'location', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-oxford-blue-500"
                  placeholder="Location"
                />
              </div>
              <textarea
                value={exp.description}
                onChange={(e) => updateWorkExperience(index, 'description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-oxford-blue-500 resize-none mb-3"
                rows={2}
                placeholder="Job description"
              />
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={exp.startDate ? new Date(exp.startDate).toISOString().split('T')[0] : ''}
                    onChange={(e) => updateWorkExperience(index, 'startDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-oxford-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">End Date</label>
                  <input
                    type="date"
                    value={exp.endDate ? new Date(exp.endDate).toISOString().split('T')[0] : ''}
                    onChange={(e) => updateWorkExperience(index, 'endDate', e.target.value)}
                    disabled={exp.current}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-oxford-blue-500 text-sm disabled:bg-gray-100"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={exp.current}
                  onChange={(e) => updateWorkExperience(index, 'current', e.target.checked)}
                  className="w-4 h-4 text-oxford-blue-600 border-gray-300 rounded focus:ring-oxford-blue-500"
                />
                <span className="text-gray-700">Currently working here</span>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* LinkedIn */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
          <Linkedin size={16} className="text-oxford-blue-600" />
          LinkedIn Profile
        </label>
        <input
          type="url"
          value={formData.alumniData.linkedIn}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            alumniData: { ...prev.alumniData, linkedIn: e.target.value }
          }))}
          className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-oxford-blue-500"
          placeholder="LinkedIn profile URL"
        />
      </div>

      {/* Expertise/Skills */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
          <Award size={18} className="text-oxford-blue-600" />
          Industry Expertise
        </label>
        <div className="flex gap-2 mb-3">
          <input
            id="expertiseInput"
            type="text"
            className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-oxford-blue-500"
            placeholder="Add expertise area"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addExpertise())}
          />
          <button
            type="button"
            onClick={addExpertise}
            className="px-4 py-2 bg-oxford-blue-600 text-white rounded-xl hover:bg-oxford-blue-700 transition-colors"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.alumniData.expertise.map((exp, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-oxford-blue-100 text-oxford-blue-700 rounded-full text-sm flex items-center gap-2"
            >
              {exp}
              <button
                type="button"
                onClick={() => removeExpertise(index)}
                className="hover:text-oxford-blue-900"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AlumniAboutForm;
