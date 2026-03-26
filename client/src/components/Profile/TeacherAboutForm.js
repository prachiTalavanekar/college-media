import React from 'react';
import { Plus, Trash2, Briefcase, BookOpen, FileText, Award } from 'lucide-react';

const TeacherAboutForm = ({ formData, setFormData }) => {
  // Teaching Experience handlers
  const addExperience = () => {
    setFormData(prev => ({
      ...prev,
      teacherData: {
        ...prev.teacherData,
        teachingExperience: [
          ...prev.teacherData.teachingExperience,
          { institution: '', position: '', subject: '', startDate: '', endDate: '', current: false }
        ]
      }
    }));
  };

  const updateExperience = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      teacherData: {
        ...prev.teacherData,
        teachingExperience: prev.teacherData.teachingExperience.map((exp, i) =>
          i === index ? { ...exp, [field]: value } : exp
        )
      }
    }));
  };

  const removeExperience = (index) => {
    setFormData(prev => ({
      ...prev,
      teacherData: {
        ...prev.teacherData,
        teachingExperience: prev.teacherData.teachingExperience.filter((_, i) => i !== index)
      }
    }));
  };

  // Research Work handlers
  const addResearch = () => {
    setFormData(prev => ({
      ...prev,
      teacherData: {
        ...prev.teacherData,
        researchWork: [
          ...prev.teacherData.researchWork,
          { title: '', description: '', field: '', year: new Date().getFullYear() }
        ]
      }
    }));
  };

  const updateResearch = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      teacherData: {
        ...prev.teacherData,
        researchWork: prev.teacherData.researchWork.map((res, i) =>
          i === index ? { ...res, [field]: value } : res
        )
      }
    }));
  };

  const removeResearch = (index) => {
    setFormData(prev => ({
      ...prev,
      teacherData: {
        ...prev.teacherData,
        researchWork: prev.teacherData.researchWork.filter((_, i) => i !== index)
      }
    }));
  };

  // Publications handlers
  const addPublication = () => {
    setFormData(prev => ({
      ...prev,
      teacherData: {
        ...prev.teacherData,
        publications: [
          ...prev.teacherData.publications,
          { title: '', journal: '', year: new Date().getFullYear(), link: '' }
        ]
      }
    }));
  };

  const updatePublication = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      teacherData: {
        ...prev.teacherData,
        publications: prev.teacherData.publications.map((pub, i) =>
          i === index ? { ...pub, [field]: value } : pub
        )
      }
    }));
  };

  const removePublication = (index) => {
    setFormData(prev => ({
      ...prev,
      teacherData: {
        ...prev.teacherData,
        publications: prev.teacherData.publications.filter((_, i) => i !== index)
      }
    }));
  };

  // Specializations handlers
  const addSpecialization = () => {
    const specInput = document.getElementById('specializationInput');
    if (specInput && specInput.value.trim()) {
      setFormData(prev => ({
        ...prev,
        teacherData: {
          ...prev.teacherData,
          specializations: [...prev.teacherData.specializations, specInput.value.trim()]
        }
      }));
      specInput.value = '';
    }
  };

  const removeSpecialization = (index) => {
    setFormData(prev => ({
      ...prev,
      teacherData: {
        ...prev.teacherData,
        specializations: prev.teacherData.specializations.filter((_, i) => i !== index)
      }
    }));
  };

  return (
    <div className="space-y-6">
      {/* Teaching Experience */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Briefcase size={18} className="text-tan-600" />
            Teaching Experience
          </label>
          <button
            type="button"
            onClick={addExperience}
            className="flex items-center gap-2 text-tan-600 hover:text-tan-700 text-sm font-semibold"
          >
            <Plus size={16} />
            Add Experience
          </button>
        </div>
        <div className="space-y-4">
          {formData.teacherData.teachingExperience.map((exp, index) => (
            <div key={index} className="p-4 bg-tan-50 rounded-xl border-2 border-tan-200">
              <div className="flex items-start justify-between mb-3">
                <input
                  type="text"
                  value={exp.institution}
                  onChange={(e) => updateExperience(index, 'institution', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tan-500"
                  placeholder="Institution name"
                />
                <button
                  type="button"
                  onClick={() => removeExperience(index)}
                  className="ml-2 p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <input
                  type="text"
                  value={exp.position}
                  onChange={(e) => updateExperience(index, 'position', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tan-500"
                  placeholder="Position"
                />
                <input
                  type="text"
                  value={exp.subject}
                  onChange={(e) => updateExperience(index, 'subject', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tan-500"
                  placeholder="Subject"
                />
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={exp.startDate ? new Date(exp.startDate).toISOString().split('T')[0] : ''}
                    onChange={(e) => updateExperience(index, 'startDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tan-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">End Date</label>
                  <input
                    type="date"
                    value={exp.endDate ? new Date(exp.endDate).toISOString().split('T')[0] : ''}
                    onChange={(e) => updateExperience(index, 'endDate', e.target.value)}
                    disabled={exp.current}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tan-500 text-sm disabled:bg-gray-100"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={exp.current}
                  onChange={(e) => updateExperience(index, 'current', e.target.checked)}
                  className="w-4 h-4 text-tan-600 border-gray-300 rounded focus:ring-tan-500"
                />
                <span className="text-gray-700">Currently working here</span>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Research Work */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <BookOpen size={18} className="text-tan-600" />
            Research Work
          </label>
          <button
            type="button"
            onClick={addResearch}
            className="flex items-center gap-2 text-tan-600 hover:text-tan-700 text-sm font-semibold"
          >
            <Plus size={16} />
            Add Research
          </button>
        </div>
        <div className="space-y-4">
          {formData.teacherData.researchWork.map((research, index) => (
            <div key={index} className="p-4 bg-tan-50 rounded-xl border-2 border-tan-200">
              <div className="flex items-start justify-between mb-3">
                <input
                  type="text"
                  value={research.title}
                  onChange={(e) => updateResearch(index, 'title', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tan-500"
                  placeholder="Research title"
                />
                <button
                  type="button"
                  onClick={() => removeResearch(index)}
                  className="ml-2 p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <textarea
                value={research.description}
                onChange={(e) => updateResearch(index, 'description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tan-500 resize-none mb-3"
                rows={2}
                placeholder="Research description"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={research.field}
                  onChange={(e) => updateResearch(index, 'field', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tan-500"
                  placeholder="Research field"
                />
                <input
                  type="number"
                  value={research.year}
                  onChange={(e) => updateResearch(index, 'year', parseInt(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tan-500"
                  placeholder="Year"
                  min="1900"
                  max={new Date().getFullYear()}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Publications */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <FileText size={18} className="text-tan-600" />
            Publications (Optional)
          </label>
          <button
            type="button"
            onClick={addPublication}
            className="flex items-center gap-2 text-tan-600 hover:text-tan-700 text-sm font-semibold"
          >
            <Plus size={16} />
            Add Publication
          </button>
        </div>
        <div className="space-y-4">
          {formData.teacherData.publications.map((pub, index) => (
            <div key={index} className="p-4 bg-tan-50 rounded-xl border-2 border-tan-200">
              <div className="flex items-start justify-between mb-3">
                <input
                  type="text"
                  value={pub.title}
                  onChange={(e) => updatePublication(index, 'title', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tan-500"
                  placeholder="Publication title"
                />
                <button
                  type="button"
                  onClick={() => removePublication(index)}
                  className="ml-2 p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <input
                  type="text"
                  value={pub.journal}
                  onChange={(e) => updatePublication(index, 'journal', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tan-500"
                  placeholder="Journal/Conference"
                />
                <input
                  type="number"
                  value={pub.year}
                  onChange={(e) => updatePublication(index, 'year', parseInt(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tan-500"
                  placeholder="Year"
                  min="1900"
                  max={new Date().getFullYear()}
                />
              </div>
              <input
                type="url"
                value={pub.link}
                onChange={(e) => updatePublication(index, 'link', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tan-500"
                placeholder="Publication link (optional)"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Specializations */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
          <Award size={18} className="text-tan-600" />
          Specializations
        </label>
        <div className="flex gap-2 mb-3">
          <input
            id="specializationInput"
            type="text"
            className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-tan-500"
            placeholder="Add a specialization"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecialization())}
          />
          <button
            type="button"
            onClick={addSpecialization}
            className="px-4 py-2 bg-tan-600 text-white rounded-xl hover:bg-tan-700 transition-colors"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.teacherData.specializations.map((spec, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-tan-100 text-tan-700 rounded-full text-sm flex items-center gap-2"
            >
              {spec}
              <button
                type="button"
                onClick={() => removeSpecialization(index)}
                className="hover:text-tan-900"
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

export default TeacherAboutForm;
