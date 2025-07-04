// src/components/ResumePreview/Templates/ModernProfessionalTemplate.tsx
import React from 'react';
import { ResumeContent, Skill, AchievementActivity, ProjectEntry } from '@/redux/slices/resumeSlice'; // Import ProjectEntry
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaLinkedin, FaGithub, FaGlobe, FaExternalLinkAlt } from 'react-icons/fa';

interface ModernProfessionalTemplateProps {
  resumeData: ResumeContent;
}

const ModernProfessionalTemplate: React.FC<ModernProfessionalTemplateProps> = ({ resumeData }) => {
  const { generalInfo, personalInfo, education, experience, skills, summary, achievementsActivities, projects } = resumeData; // Destructure projects

  const renderSectionTitle = (title: string) => (
    <div className="flex items-center mb-2 mt-4">
      <h3 className="text-lg font-bold uppercase tracking-wide text-gray-800 flex-shrink-0 mr-2">
        {title}
      </h3>
      <div className="flex-grow border-t border-gray-400"></div>
    </div>
  );

  // Helper to group skills by category (unchanged)
  const categorizedSkills: { [key: string]: Skill[] } = skills.reduce((acc, skill) => {
    const category = skill.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(skill);
    return acc;
  }, {} as { [key: string]: Skill[] });

  return (
    <div className="font-sans text-gray-800 p-6 bg-white shadow-lg max-w-3xl mx-auto my-4 text-sm leading-normal">
      {/* ----------HEADING---------- */}
      <div className="text-center mb-4">
        <h1 className="text-4xl font-extrabold uppercase text-gray-900 leading-none">
          {personalInfo.name || 'Your Name'}
        </h1>
        <div className="text-gray-700 text-xs mt-1">
          {personalInfo.jobTitle || ''} {personalInfo.jobTitle && personalInfo.city && ' — '} {personalInfo.city || ''}
        </div>
        <div className="flex justify-center flex-wrap gap-x-4 gap-y-1 text-xs text-gray-700 mt-2">
          {personalInfo.phone && (
            <span className="flex items-center">
              <FaPhone className="mr-1 text-gray-600" size={8} /> {personalInfo.phone}
            </span>
          )}
          {personalInfo.email && (
            <a href={`mailto:${personalInfo.email}`} className="flex items-center hover:underline text-blue-700">
              <FaEnvelope className="mr-1 text-gray-600" size={8} /> {personalInfo.email}
            </a>
          )}
          {generalInfo.linkedin && (
            <a href={generalInfo.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center hover:underline text-blue-700">
              <FaLinkedin className="mr-1 text-gray-600" size={8} /> LinkedIn
            </a>
          )}
          {generalInfo.github && (
            <a href={generalInfo.github} target="_blank" rel="noopener noreferrer" className="flex items-center hover:underline text-blue-700">
              <FaGithub className="mr-1 text-gray-600" size={8} /> GitHub
            </a>
          )}
          {generalInfo.portfolio && (
            <a href={generalInfo.portfolio} target="_blank" rel="noopener noreferrer" className="flex items-center hover:underline text-blue-700">
              <FaGlobe className="mr-1 text-gray-600" size={8} /> Portfolio
            </a>
          )}
        </div>
      </div>

      {/* -----------SUMMARY----------- */}
      {summary && (
        <section className="mb-4">
          {renderSectionTitle('Summary')}
          <p className="text-gray-700 text-sm leading-relaxed">{summary}</p>
        </section>
      )}

      {/* -----------SKILLS----------- */}
      {skills.length > 0 && (
        <section className="mb-4">
          {renderSectionTitle('Skills')}
          <ul className="flex flex-col">
            {Object.entries(categorizedSkills).sort(([catA], [catB]) => catA.localeCompare(catB)).map(([category, skillList]) => (
              <li key={category} className="mb-1">
                <strong className="text-gray-800">{category}:</strong>{' '}
                {skillList.map(s => `${s.name}${s.level ? ` (${s.level})` : ''}`).join(', ')}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* -----------PROJECTS----------- */}
      {projects.length > 0 && (
        <section className="mb-4">
          {renderSectionTitle('Projects')}
          <ul className="list-none p-0 m-0">
            {projects.map((project) => (
              <li key={project.id} className="mb-3">
                <div className="flex justify-between items-baseline mb-0.5">
                  <h4 className="font-bold text-gray-800">{project.name}</h4>
                  <div className="flex gap-2 text-xs text-blue-700">
                    {project.githubLink && (
                        <a href={project.githubLink} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center">
                            <FaGithub className="mr-1" />
                        </a>
                    )}
                    {project.liveLink && (
                        <a href={project.liveLink} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center">
                            <FaExternalLinkAlt className="mr-1" />
                        </a>
                    )}
                  </div>
                </div>
                {project.bulletPoints.length > 0 && (
                  <ul className="list-disc list-outside ml-5 text-gray-700">
                    {project.bulletPoints.map((point, i) => (
                      <li key={i} className="mb-0.5">{point}</li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}


      {/* -----------EXPERIENCE----------- */}
      {experience.length > 0 && (
        <section className="mb-4">
          {renderSectionTitle('Experience')}
          <ul className="list-none p-0 m-0">
            {experience.map((exp) => (
              <li key={exp.id} className="mb-3">
                <div className="flex justify-between items-baseline mb-0.5">
                  <h4 className="font-bold text-gray-800">{exp.jobTitle} at {exp.company}</h4>
                  <p className="text-xs text-gray-600">{exp.startDate} -- {exp.endDate}</p>
                </div>
                <ul className="list-disc list-outside ml-5 text-gray-700">
                  {exp.responsibilities.map((res, i) => (
                    <li key={i} className="mb-0.5">{res}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* -----------EDUCATION----------- */}
      {education.length > 0 && (
        <section className="mb-4">
          {renderSectionTitle('Education')}
          <ul className="list-none p-0 m-0">
            {education.map((edu) => (
              <li key={edu.id} className="mb-3">
                <div className="flex justify-between items-baseline mb-0.5">
                  <h4 className="font-bold text-gray-800">{edu.degree} in {edu.fieldOfStudy}</h4>
                  <p className="text-xs text-gray-600">
                    {edu.endDate && `GPA: ${edu.description}`}{edu.endDate && (edu.description ? ' -- ' : '')} {edu.endDate}
                  </p>
                </div>
                <p className="text-sm text-gray-700">{edu.institution}</p>
                <p className="text-xs text-gray-600">{edu.startDate} -- {edu.endDate}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* -----------ACHIEVEMENTS & ACTIVITIES----------- */}
      {achievementsActivities.length > 0 && (
        <section className="mb-4">
          {renderSectionTitle('Achievements & Activities')}
          <ul className="list-disc list-outside ml-5 text-gray-700">
            {achievementsActivities.map((item) => (
              <li key={item.id} className="mb-0.5">
                {item.description}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};

export default ModernProfessionalTemplate;