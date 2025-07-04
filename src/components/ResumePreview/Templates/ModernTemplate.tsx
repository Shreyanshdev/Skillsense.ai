// src/components/ResumePreview/Templates/ModernTemplate.tsx
import React from 'react';
import { ResumeContent } from '@/redux/slices/resumeSlice';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaLinkedin, FaGithub } from 'react-icons/fa';

interface ModernTemplateProps {
  resumeData: ResumeContent;
}

const ModernTemplate: React.FC<ModernTemplateProps> = ({ resumeData }) => {
  const { generalInfo, personalInfo, education, experience, skills, summary } = resumeData;

  return (
    <div className="font-sans text-gray-800 p-6 bg-white shadow-lg rounded-lg">
      {/* Header - Name & Job Title */}
      <div className="flex items-center justify-between mb-6 border-b-2 border-blue-600 pb-4">
        <div>
          <h1 className="text-4xl font-extrabold text-blue-700 leading-tight">
            {personalInfo.name || 'Your Name'}
          </h1>
          <h2 className="text-2xl font-semibold text-gray-700">
            {personalInfo.jobTitle || 'Your Job Title'}
          </h2>
        </div>
        {personalInfo.photoUrl && (
          <img
            src={personalInfo.photoUrl}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover border-4 border-blue-200 shadow-md"
          />
        )}
      </div>

      {/* Contact Info */}
      <div className="flex flex-wrap gap-x-6 gap-y-2 mb-6 text-gray-600 text-sm">
        {personalInfo.phone && (
          <span className="flex items-center">
            <FaPhone className="mr-1 text-blue-500" /> {personalInfo.phone}
          </span>
        )}
        {personalInfo.email && (
          <span className="flex items-center">
            <FaEnvelope className="mr-1 text-blue-500" /> {personalInfo.email}
          </span>
        )}
        {personalInfo.city && (
          <span className="flex items-center">
            <FaMapMarkerAlt className="mr-1 text-blue-500" /> {personalInfo.city}
          </span>
        )}
        {generalInfo.linkedin && (
          <span className="flex items-center">
            <FaLinkedin className="mr-1 text-blue-500" />{' '}
            <a href={generalInfo.linkedin} target="_blank" rel="noopener noreferrer" className="hover:underline text-blue-600">
              LinkedIn
            </a>
          </span>
        )}
        {generalInfo.github && (
          <span className="flex items-center">
            <FaGithub className="mr-1 text-blue-500" />{' '}
            <a href={generalInfo.github} target="_blank" rel="noopener noreferrer" className="hover:underline text-blue-600">
              GitHub
            </a>
          </span>
        )}
      </div>

      {/* Summary */}
      {summary && (
        <section className="mb-6">
          <h3 className="text-xl font-bold text-blue-700 mb-2 pb-1 border-b border-blue-300">Summary</h3>
          <p className="text-gray-700 leading-relaxed">{summary}</p>
        </section>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <section className="mb-6">
          <h3 className="text-xl font-bold text-blue-700 mb-2 pb-1 border-b border-blue-300">Experience</h3>
          {experience.map((exp) => (
            <div key={exp.id} className="mb-4 last:mb-0">
              <h4 className="text-lg font-semibold text-gray-800">{exp.jobTitle} at {exp.company}</h4>
              <p className="text-sm text-gray-600 mb-1">{exp.startDate} - {exp.endDate}</p>
              <ul className="list-disc list-inside text-gray-700 ml-4">
                {exp.responsibilities.map((res, i) => (
                  <li key={i} className="mb-0.5">{res}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}

      {/* Education */}
      {education.length > 0 && (
        <section className="mb-6">
          <h3 className="text-xl font-bold text-blue-700 mb-2 pb-1 border-b border-blue-300">Education</h3>
          {education.map((edu) => (
            <div key={edu.id} className="mb-4 last:mb-0">
              <h4 className="text-lg font-semibold text-gray-800">{edu.degree} in {edu.fieldOfStudy}</h4>
              <p className="text-base text-gray-700">{edu.institution}</p>
              <p className="text-sm text-gray-600">{edu.startDate} - {edu.endDate}</p>
              {edu.description && <p className="text-sm text-gray-700 mt-1">{edu.description}</p>}
            </div>
          ))}
        </section>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <section>
          <h3 className="text-xl font-bold text-blue-700 mb-2 pb-1 border-b border-blue-300">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill.id}
                className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full"
              >
                {skill.name} {skill.level && `(${skill.level})`}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ModernTemplate;