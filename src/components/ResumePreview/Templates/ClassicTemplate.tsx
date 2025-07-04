// src/components/ResumePreview/Templates/ClassicTemplate.tsx
import React from 'react';
import { ResumeContent } from '@/redux/slices/resumeSlice';

interface ClassicTemplateProps {
  resumeData: ResumeContent;
}

const ClassicTemplate: React.FC<ClassicTemplateProps> = ({ resumeData }) => {
  const { generalInfo, personalInfo, education, experience, skills, summary } = resumeData;

  return (
    <div className="font-serif text-gray-700 p-6 bg-white shadow-lg rounded-lg">
      {/* Header - Name & Contact Info */}
      <div className="text-center mb-6 pb-4 border-b border-gray-400">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">
          {personalInfo.name || 'Your Name'}
        </h1>
        <p className="text-sm text-gray-600 mb-2">
          {personalInfo.jobTitle || 'Your Job Title'}
        </p>
        <p className="text-sm text-gray-600">
          {personalInfo.phone} | {personalInfo.email} | {personalInfo.city}
        </p>
        {(generalInfo.linkedin || generalInfo.github) && (
          <p className="text-sm text-gray-600 mt-1">
            {generalInfo.linkedin && <a href={generalInfo.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline">LinkedIn</a>}
            {generalInfo.linkedin && generalInfo.github && ' | '}
            {generalInfo.github && <a href={generalInfo.github} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline">GitHub</a>}
          </p>
        )}
      </div>

      {/* Summary */}
      {summary && (
        <section className="mb-5">
          <h3 className="text-lg font-bold text-gray-800 mb-1 pb-0.5 border-b border-gray-300">Summary</h3>
          <p className="text-sm leading-relaxed">{summary}</p>
        </section>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <section className="mb-5">
          <h3 className="text-lg font-bold text-gray-800 mb-1 pb-0.5 border-b border-gray-300">Experience</h3>
          {experience.map((exp) => (
            <div key={exp.id} className="mb-3 last:mb-0">
              <div className="flex justify-between items-baseline">
                <h4 className="text-md font-semibold text-gray-800">{exp.jobTitle} - {exp.company}</h4>
                <p className="text-xs text-gray-600">{exp.startDate} - {exp.endDate}</p>
              </div>
              <ul className="list-disc list-inside text-sm text-gray-700 ml-4">
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
        <section className="mb-5">
          <h3 className="text-lg font-bold text-gray-800 mb-1 pb-0.5 border-b border-gray-300">Education</h3>
          {education.map((edu) => (
            <div key={edu.id} className="mb-3 last:mb-0">
              <div className="flex justify-between items-baseline">
                <h4 className="text-md font-semibold text-gray-800">{edu.degree} in {edu.fieldOfStudy}</h4>
                <p className="text-xs text-gray-600">{edu.startDate} - {edu.endDate}</p>
              </div>
              <p className="text-sm text-gray-700">{edu.institution}</p>
              {edu.description && <p className="text-xs text-gray-600 mt-0.5">{edu.description}</p>}
            </div>
          ))}
        </section>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <section>
          <h3 className="text-lg font-bold text-gray-800 mb-1 pb-0.5 border-b border-gray-300">Skills</h3>
          <p className="text-sm text-gray-700">{skills.map(s => `${s.name}${s.level ? ` (${s.level})` : ''}`).join(', ')}</p>
        </section>
      )}
    </div>
  );
};

export default ClassicTemplate;