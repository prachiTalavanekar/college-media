import React from 'react';
import { Plus, Trash2, Code, Link as LinkIcon, Github, Linkedin } from 'lucide-react';

const StudentAboutForm = ({ formData, setFormData }) => {
  const addProject = () => {
    setFormData(prev => ({
      ...prev,
      studentData: {
        ...prev.studentData,
        projects: [
          ...prev.studentData.projects,
          { title: '', description: '', technologies: [], link: '', startDate: '', endDate: '' }
        ]
      }
    }));
  };

  const updateProject = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      studentData: {
        ...prev.studentData,
        projects: prev.studentData.projects.map((proj, i) =>
          i === index ? { ...proj, [field]: value } : proj
        )
      }
    }));
  };

  const removeProject = (index) => {
    setFormData(prev => ({
      ...prev,
      studentData: {
        ...prev.studentData,
        projects: prev.studentData.projects.filter((_, i) => i !== index)
      }
    }));
  };

  const addTechnology = (projectIndex) => {
    const techInput = document.getElementById(`tech-${projectIndex}`);
    if (techInput && techInput.value.trim()) {
      const updatedProjects = [...formData.studentData.projects];
      if (!updatedProjects[projectIndex].technologies) {
        updatedProjects[projectIndex].technologies = [];
      }
      updatedProjects[projectIndex].technologies.push(techInput.value.trim());
      setFormData(prev => ({
        ...prev,
        studentData: {
          ...prev.studentData,
          projects: updatedProjects
        }
      }));
      techInput.value = '';
    }
  };

  const removeTechnology = (projectIndex, techIndex) => {
    const updatedProjects = [...formData.studentData.projects];
    updatedProjects[projectIndex].technologies = updatedProjects[projectIndex].technologies.filter((_, i) => i !== techIndex);
    setFormData(prev => ({
      ...prev,
      studentData: {
        ...prev.studentData,
        projects: updatedProjects
      }
    }));
  };

  return (
    <div className="space-y-6">
      {/* Projects Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Code size={18} className="text-oxford-blue-600" />
            Projects
          </label>
          <button
            type="button"
            onClick={addProject}
            className="flex items-center gap-2 text-oxford-blue-600 hover:text-oxford-blue-700 text-sm font-semibold"
          >
            <Plus size={16} />
            Add Project
          </button>
        </div>
        <div className="space-y-4">
          {formData.studentData.projects.map((project, index) => (
            <div key={index} className="p-4 bg-oxford-blue-50 rounded-xl border-2 border-oxford-blue-200">
              <div className="flex items-start justify-between mb-3">
                <input
                  type="text"
                  value={project.title}
                  onChange={(e) => updateProject(index, 'title', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-oxford-blue-500"
                  placeholder="Project title"
                />
                <button
                  type="button"
                  onClick={() => removeProject(index)}
                  className="ml-2 p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <textarea
                value={project.description}
                onChange={(e) => updateProject(index, 'description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-oxford-blue-500 resize-none mb-3"
                rows={3}
                placeholder="Project description"
              />
              
              {/* Technologies */}
              <div className="mb-3">
                <label className="block text-xs font-semibold text-gray-600 mb-2">Technologies Used</label>
                <div className="flex gap-2 mb-2">
                  <input
                    id={`tech-${index}`}
                    type="text"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-oxford-blue-500 text-sm"
                    placeholder="e.g., React, Node.js"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTechnology(index))}
                  />
                  <button
                    type="button"
                    onClick={() => addTechnology(index)}
                    className="px-3 py-2 bg-oxford-blue-600 text-white rounded-lg hover:bg-oxford-blue-700 text-sm"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {project.technologies?.map((tech, techIndex) => (
                    <span
                      key={techIndex}
                      className="px-2 py-1 bg-oxford-blue-100 text-oxford-blue-700 rounded-full text-xs flex items-center gap-1"
                    >
                      {tech}
                      <button
                        type="button"
                        onClick={() => removeTechnology(index, techIndex)}
                        className="hover:text-oxford-blue-900"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : ''}
                    onChange={(e) => updateProject(index, 'startDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-oxford-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">End Date</label>
                  <input
                    type="date"
                    value={project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : ''}
                    onChange={(e) => updateProject(index, 'endDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-oxford-blue-500 text-sm"
                  />
                </div>
              </div>

              <input
                type="url"
                value={project.link}
                onChange={(e) => updateProject(index, 'link', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-oxford-blue-500 text-sm"
                placeholder="Project link (GitHub, Demo, etc.)"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Social Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <Linkedin size={16} className="text-oxford-blue-600" />
            LinkedIn
          </label>
          <input
            type="url"
            value={formData.studentData.linkedIn}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              studentData: { ...prev.studentData, linkedIn: e.target.value }
            }))}
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-oxford-blue-500"
            placeholder="LinkedIn profile URL"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <Github size={16} className="text-oxford-blue-600" />
            GitHub
          </label>
          <input
            type="url"
            value={formData.studentData.github}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              studentData: { ...prev.studentData, github: e.target.value }
            }))}
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-oxford-blue-500"
            placeholder="GitHub profile URL"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <LinkIcon size={16} className="text-oxford-blue-600" />
            Portfolio
          </label>
          <input
            type="url"
            value={formData.studentData.portfolio}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              studentData: { ...prev.studentData, portfolio: e.target.value }
            }))}
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-oxford-blue-500"
            placeholder="Portfolio website URL"
          />
        </div>
      </div>
    </div>
  );
};

export default StudentAboutForm;
