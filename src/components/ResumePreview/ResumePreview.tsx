// src/components/ResumePreview/ResumePreview.tsx
'use client';

import React, { forwardRef } from 'react'; // Keep forwardRef here
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

// Import your templates
import ModernTemplate from './Templates/ModernTemplate';
import ClassicTemplate from './Templates/ClassicTemplate';
import ModernProfessionalTemplate from './Templates/ModernProfessionalTemplate'; // Your new template

// Use forwardRef to pass the ref down to the DOM element
const ResumePreview = forwardRef<HTMLDivElement>((props, ref) => { // <-- Correct way to use forwardRef
  const resumeState = useSelector((state: RootState) => state.resume);
  const { resumeData, templateId } = resumeState;

  const renderTemplate = () => {
    switch (templateId) {
      case 'modern-professional':
        return <ModernProfessionalTemplate resumeData={resumeData} />;
      case 'modern':
        return <ModernTemplate resumeData={resumeData} />;
      case 'classic':
        return <ClassicTemplate resumeData={resumeData} />;
      case 'default':
      default:
        return <ModernProfessionalTemplate resumeData={resumeData} />; // Set this as default
    }
  };

  return (
    // Apply the 'ref' directly to the outermost div that wraps your template content
    <div ref={ref} className="w-full h-full flex flex-col items-center justify-center bg-white shadow-lg overflow-auto">
      {renderTemplate()}
    </div>
  );
});

ResumePreview.displayName = 'ResumePreview'; // Good practice for debugging

export default ResumePreview;