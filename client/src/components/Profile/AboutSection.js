import React from 'react';
import { 
  Award, 
  Code, 
  Briefcase, 
  BookOpen, 
  FileText, 
  Link as LinkIcon, 
  Github, 
  Linkedin,
  Calendar,
  MapPin,
  Building2,
  GraduationCap
} from 'lucide-react';

const AboutSection = ({ userData }) => {
  const { about, skills, role } = userData;

  if (!about && (!skills || skills.length === 0)) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>No information added yet.</p>
      </div>
    );
  }

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      {/* Bio */}
      {about?.bio && (
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-3">About</h3>
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{about.bio}</p>
        </div>
      )}

      {/* Skills */}
      {skills && skills.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Code size={20} className="text-oxford-blue-600" />
            Skills
          </h3>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1.5 bg-oxford-blue-100 text-oxford-blue-700 rounded-full text-sm font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Achievements */}
      {about?.achievements && about.achievements.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Award size={20} className="text-oxford-blue-600" />
            Achievements
          </h3>
          <div className="space-y-3">
            {about.achievements.map((achievement, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">{achievement.title}</h4>
                  {achievement.date && (
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <Calendar size={14} />
                      {formatDate(achievement.date)}
                    </span>
                  )}
                </div>
                {achievement.description && (
                  <p className="text-gray-600 text-sm">{achievement.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Student-specific sections */}
      {role === 'student' && about?.student && (
        <>
          {/* Projects */}
          {about.student.projects && about.student.projects.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Code size={20} className="text-oxford-blue-600" />
                Projects
              </h3>
              <div className="space-y-4">
                {about.student.projects.map((project, index) => (
                  <div key={index} className="p-4 bg-oxford-blue-50 rounded-xl border-2 border-oxford-blue-200">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">{project.title}</h4>
                      {project.link && (
                        <a
                          href={project.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-oxford-blue-600 hover:text-oxford-blue-700"
                        >
                          <LinkIcon size={18} />
                        </a>
                      )}
                    </div>
                    {project.description && (
                      <p className="text-gray-600 text-sm mb-3">{project.description}</p>
                    )}
                    {project.technologies && project.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {project.technologies.map((tech, techIndex) => (
                          <span
                            key={techIndex}
                            className="px-2 py-1 bg-oxford-blue-100 text-oxford-blue-700 rounded text-xs font-medium"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                    {(project.startDate || project.endDate) && (
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <Calendar size={14} />
                        {formatDate(project.startDate)} - {project.endDate ? formatDate(project.endDate) : 'Present'}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Social Links */}
          {(about.student.linkedIn || about.student.github || about.student.portfolio) && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Links</h3>
              <div className="flex flex-wrap gap-3">
                {about.student.linkedIn && (
                  <a
                    href={about.student.linkedIn}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-oxford-blue-600 text-white rounded-xl hover:bg-oxford-blue-700 transition-colors"
                  >
                    <Linkedin size={18} />
                    LinkedIn
                  </a>
                )}
                {about.student.github && (
                  <a
                    href={about.student.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-xl hover:bg-gray-900 transition-colors"
                  >
                    <Github size={18} />
                    GitHub
                  </a>
                )}
                {about.student.portfolio && (
                  <a
                    href={about.student.portfolio}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-tan-600 text-white rounded-xl hover:bg-tan-700 transition-colors"
                  >
                    <LinkIcon size={18} />
                    Portfolio
                  </a>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Teacher-specific sections */}
      {role === 'teacher' && about?.teacher && (
        <>
          {/* Teaching Experience */}
          {about.teacher.teachingExperience && about.teacher.teachingExperience.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Briefcase size={20} className="text-tan-600" />
                Teaching Experience
              </h3>
              <div className="space-y-4">
                {about.teacher.teachingExperience.map((exp, index) => (
                  <div key={index} className="p-4 bg-tan-50 rounded-xl border-2 border-tan-200">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900">{exp.position}</h4>
                        <p className="text-gray-700 font-medium">{exp.institution}</p>
                        {exp.subject && (
                          <p className="text-gray-600 text-sm">Subject: {exp.subject}</p>
                        )}
                      </div>
                      {exp.current && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                          Current
                        </span>
                      )}
                    </div>
                    {(exp.startDate || exp.endDate) && (
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <Calendar size={14} />
                        {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Research Work */}
          {about.teacher.researchWork && about.teacher.researchWork.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <BookOpen size={20} className="text-tan-600" />
                Research Work
              </h3>
              <div className="space-y-3">
                {about.teacher.researchWork.map((research, index) => (
                  <div key={index} className="p-4 bg-tan-50 rounded-xl border-2 border-tan-200">
                    <h4 className="font-semibold text-gray-900 mb-2">{research.title}</h4>
                    {research.description && (
                      <p className="text-gray-600 text-sm mb-2">{research.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      {research.field && <span>Field: {research.field}</span>}
                      {research.year && <span>Year: {research.year}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Publications */}
          {about.teacher.publications && about.teacher.publications.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <FileText size={20} className="text-tan-600" />
                Publications
              </h3>
              <div className="space-y-3">
                {about.teacher.publications.map((pub, index) => (
                  <div key={index} className="p-4 bg-tan-50 rounded-xl border-2 border-tan-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">{pub.title}</h4>
                        <p className="text-gray-600 text-sm">{pub.journal}</p>
                        {pub.year && (
                          <p className="text-gray-500 text-sm mt-1">Year: {pub.year}</p>
                        )}
                      </div>
                      {pub.link && (
                        <a
                          href={pub.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-tan-600 hover:text-tan-700 ml-2"
                        >
                          <LinkIcon size={18} />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Specializations */}
          {about.teacher.specializations && about.teacher.specializations.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Specializations</h3>
              <div className="flex flex-wrap gap-2">
                {about.teacher.specializations.map((spec, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-tan-100 text-tan-700 rounded-full text-sm font-medium"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Alumni-specific sections */}
      {role === 'alumni' && about?.alumni && (
        <>
          {/* Current Position */}
          {(about.alumni.currentPosition || about.alumni.currentCompany) && (
            <div className="p-4 bg-gradient-to-r from-oxford-blue-50 to-tan-50 rounded-xl border-2 border-oxford-blue-200">
              <h3 className="text-sm font-semibold text-gray-600 mb-2">Current Position</h3>
              <div className="flex items-center gap-2 mb-1">
                <Briefcase size={18} className="text-oxford-blue-600" />
                <span className="font-bold text-gray-900">{about.alumni.currentPosition}</span>
              </div>
              {about.alumni.currentCompany && (
                <div className="flex items-center gap-2">
                  <Building2 size={18} className="text-tan-600" />
                  <span className="text-gray-700">{about.alumni.currentCompany}</span>
                </div>
              )}
              {about.alumni.industry && (
                <p className="text-sm text-gray-600 mt-2">Industry: {about.alumni.industry}</p>
              )}
            </div>
          )}

          {/* Work Experience */}
          {about.alumni.workExperience && about.alumni.workExperience.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Briefcase size={20} className="text-oxford-blue-600" />
                Work Experience
              </h3>
              <div className="space-y-4">
                {about.alumni.workExperience.map((exp, index) => (
                  <div key={index} className="p-4 bg-oxford-blue-50 rounded-xl border-2 border-oxford-blue-200">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900">{exp.position}</h4>
                        <p className="text-gray-700 font-medium">{exp.company}</p>
                        {exp.location && (
                          <p className="text-gray-600 text-sm flex items-center gap-1 mt-1">
                            <MapPin size={14} />
                            {exp.location}
                          </p>
                        )}
                      </div>
                      {exp.current && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                          Current
                        </span>
                      )}
                    </div>
                    {exp.description && (
                      <p className="text-gray-600 text-sm mb-2">{exp.description}</p>
                    )}
                    {(exp.startDate || exp.endDate) && (
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <Calendar size={14} />
                        {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* LinkedIn */}
          {about.alumni.linkedIn && (
            <div>
              <a
                href={about.alumni.linkedIn}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-oxford-blue-600 text-white rounded-xl hover:bg-oxford-blue-700 transition-colors"
              >
                <Linkedin size={18} />
                Connect on LinkedIn
              </a>
            </div>
          )}

          {/* Expertise */}
          {about.alumni.expertise && about.alumni.expertise.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Industry Expertise</h3>
              <div className="flex flex-wrap gap-2">
                {about.alumni.expertise.map((exp, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-oxford-blue-100 text-oxford-blue-700 rounded-full text-sm font-medium"
                  >
                    {exp}
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AboutSection;
