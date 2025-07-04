'use client';

import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store';
import AppLayout from '@/components/Layout/AppLayout';
import { motion } from 'framer-motion';
import { FaMagic, FaDownload, FaSpinner, FaSave, FaEye, FaTimes, } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '@/services/api';
import { TextEditor } from '@/components/TextEditor/TextEditor';

import htmlToPdfmake from 'html-to-pdfmake';
import { useParams } from 'next/navigation';
import type { TDocumentDefinitions } from 'pdfmake/interfaces';

import pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
pdfMake.vfs = pdfFonts.vfs;

const generatePdfDocDefinition = ({
  yourName,
  jobRole,
  description,
  content,
}: {
  yourName: string;
  jobRole: string;
  description: string;
  content: string;
}): TDocumentDefinitions => {
  const fullHtml = `
    <div>
      <h1>Cover Letter for ${jobRole}</h1>
      <h3>By ${yourName}</h3>
      ${description ? `<p><i>Notes: ${description}</i></p>` : ''}
      ${content}
    </div>
  `;
  const pdfContent = htmlToPdfmake(fullHtml);
  return {
    pageSize: 'A4',
    pageMargins: [40, 60, 40, 60] as [number, number, number, number],
    content: pdfContent,
    styles: {
      header: { fontSize: 20, bold: true, margin: [0, 0, 0, 8] },
      subheader: { fontSize: 14, color: 'gray' },
      body: { fontSize: 12, lineHeight: 1.4 },
    },
  };
};

const CoverLetterGeneratorPage = () => {
  const dispatch: AppDispatch = useDispatch();
  const params = useParams();
  const letterId = params.letterId as string;
  const isLoadingAI = useSelector((state: RootState) => state.resume.isLoadingAI);
  const theme = useSelector((state: RootState) => state.theme.theme);
  const isDark = theme === 'dark';
  const [showPreview, setShowPreview] = useState(false); 
  const [jobRole, setJobRole] = useState('');
  const [yourName, setYourName] = useState('');
  const [description, setDescription] = useState('');
  const [coverLetterContent, setCoverLetterContent] = useState('');


  const labelColor = isDark ? 'text-gray-300' : 'text-gray-700';
  const pageBgClass = isDark ? 'bg-gray-950' : 'bg-gray-50';
  const headerTextColor = isDark ? 'text-gray-100' : 'text-gray-800';
  const subheaderTextColor = isDark ? 'text-gray-300' : 'text-gray-600';
  const formSectionBg = isDark ? 'bg-gray-800/80 border-gray-700' : 'bg-white border-gray-200';
  const inputStyles = `w-full mb-3 px-3 py-2 rounded-md border shadow-sm text-sm ${
    isDark ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
  } ${isDark ? 'focus:ring-red-700 focus:border-red-700' : 'focus:ring-red-500 focus:border-red-500'}`;

  const aiButtonClass = `inline-flex items-center px-6 py-3 rounded-xl shadow-lg text-lg font-semibold ${
    isDark ? 'bg-sky-700 text-white hover:bg-sky-800' : 'bg-sky-500 text-white hover:bg-sky-600'
  } focus:outline-none focus:ring-2 ${isDark ? 'focus:ring-sky-700 focus:ring-offset-gray-950' : 'focus:ring-sky-500 focus:ring-offset-white'}`;

  const downloadButtonClass = `inline-flex items-center px-6 py-3 rounded-xl shadow-lg text-lg font-semibold ${
    isDark ? 'bg-green-700 text-white hover:bg-green-800' : 'bg-green-600 text-white hover:bg-green-700'
  } focus:outline-none focus:ring-2 ${isDark ? 'focus:ring-green-700 focus:ring-offset-gray-950' : 'focus:ring-green-500 focus:ring-offset-white'}`;

  const fetchLetter = async () => {
    try {
      const res = await api.get('/history?recordId=' + letterId);
      const data = res.data;
  
      // Convert the string metadeta into an object
      const metaObj = typeof data.metadeta === 'string'
        ? JSON.parse(data.metadeta)
        : data.metadeta || {};
  
      const [first] = data.content || [];
  
      setCoverLetterContent(first?.content || '');
      setYourName(metaObj.yourName || '');
      setJobRole(metaObj.jobRole || '');
      setDescription(metaObj.description || '');
    } catch (err) {
      console.error('Failed to load letter history:', err);
    }
  };
  useEffect(() => {
    fetchLetter();
  }, [letterId]);

  const handleEditorChange = (event: any) => {
    setCoverLetterContent(event.target.value);
  };

  const handleGenerateCoverLetter = async () => {
    if (!jobRole.trim() || !yourName.trim()) {
      toast.error('Please enter your Name and the Job Role.');
      return;
    }

    dispatch({ type: 'resume/setAILoading', payload: true });
    toast.loading('Generating cover letter with AI...', { id: 'ai-gen-cl' });

    try {
      const response = await api.post('/ai-cover-letter', {
        jobRole,
        yourName,
        description: description.trim(),
      });
      setCoverLetterContent(response.data.coverLetter);
      toast.success('Cover letter generated!', { id: 'ai-gen-cl' });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to generate cover letter.';
      dispatch({ type: 'resume/setAIError', payload: errorMessage });
      toast.error(errorMessage, { id: 'ai-gen-cl' });
    } finally {
      dispatch({ type: 'resume/setAILoading', payload: false });
    }
  };

  const handleSave = async () => {
    try {
      await api.put('/history', {
        recordId: letterId,
      metadeta: { yourName, jobRole, description }, 
      content: [
        {
          type: 'text',
          role: 'assistant',
          content: coverLetterContent,
        },
      ],
    });
      toast.success('Letter saved to history.');
    } catch (err) {
      toast.error('Failed to save letter.');
    }
  };


  const handleDownloadCoverLetter = () => {
    const docDefinition = generatePdfDocDefinition({
      yourName,
      jobRole,
      description,
      content: coverLetterContent,
    });
    pdfMake.createPdf(docDefinition).download('AI_Cover_Letter.pdf');
  };

  return (
    <AppLayout>
      <div className={`min-h-screen flex flex-col ${pageBgClass} p-4 md:p-6`}>
        <header className="mb-6 text-center">
          <h1 className={`text-3xl sm:text-4xl font-bold ${headerTextColor}`}>AI Cover Letter Generator</h1>
          <p className={`text-sm sm:text-base mt-1 ${subheaderTextColor}`}>Craft a personalized letter in seconds</p>
        </header>
  
        {/* PREVIEW BUTTON - Mobile Only */}
        <div className="md:hidden mb-4">
          {!showPreview ? (
            <button
              onClick={() => setShowPreview(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition cursor-pointer"
            >
              <FaEye /> Preview Letter
            </button>
          ) : null}
        </div>
  
        <div className="grid grid-cols-1 md:grid-cols-[60%_40%] gap-6 w-full max-w-7xl mx-auto">
          {/* Left: Form + Editor */}
          <div className={`rounded-xl p-4 sm:p-6 border ${formSectionBg}`}>
            {/* Your Name */}
            <label className={`block mb-1 text-sm font-medium ${labelColor}`} htmlFor="yourName">
              Your Name
            </label>
            <input
              id="yourName"
              value={yourName}
              onChange={(e) => setYourName(e.target.value)}
              placeholder="John Doe"
              className={inputStyles + ' cursor-pointer'}
            />

            {/* Job Role */}
            <label className={`block mt-4 mb-1 text-sm font-medium ${labelColor}`} htmlFor="jobRole">
              Target Job Role
            </label>
            <input
              id="jobRole"
              value={jobRole}
              onChange={(e) => setJobRole(e.target.value)}
              placeholder="e.g. Frontend Developer"
              className={inputStyles + ' cursor-pointer'}
            />

            {/* Extra Notes / Description */}
            <label className={`block mt-4 mb-1 text-sm font-medium ${labelColor}`} htmlFor="description">
              Tell us more about yourself (optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mention your experience, skills, achievements, goals, or any specific points you'd like to highlight in the cover letter."
              rows={3}
              className={inputStyles + ' cursor-pointer'}
            />

            {/* Text Editor */}
            <label className={`block mt-4 mb-1 text-sm font-medium ${labelColor}`}>Cover Letter Editor</label>
            <div className={`rounded-md overflow-hidden shadow-sm border transition-all duration-300 ${isDark ? 'border-gray-700 bg-gray-900' : 'border-gray-300 bg-white'}`}>
              <TextEditor
                value={coverLetterContent}
                onChange={handleEditorChange}
                placeholder="Write your cover letter here..."
                className={`
                  w-full min-h-[200px] max-h-[600px] overflow-y-auto px-4 py-3 text-sm outline-none
                  ${isDark
                    ? 'bg-gray-900 text-gray-100 placeholder-gray-400'
                    : 'bg-white text-gray-900 placeholder-gray-500'}
                  prose prose-sm focus:ring-2 focus:ring-red-500 focus:outline-none
                `}
              />
            </div>

            {/* Generate Button */}
            <motion.button
              onClick={handleGenerateCoverLetter}
              disabled={isLoadingAI}
              className={`mt-4 px-4 py-2 rounded-md text-sm font-semibold flex justify-center items-center gap-2
                          ${isDark ? 'bg-red-700 hover:bg-red-800' : 'bg-red-500 hover:bg-red-600'}
                          text-white shadow cursor-pointer transition w-full`}
            >
              {isLoadingAI ? <FaSpinner className="animate-spin" /> : <FaMagic />} Generate with AI
            </motion.button>
          </div>

  
          {/* Right: Live Preview (conditionally rendered on mobile) */}
          {(showPreview || typeof window !== 'undefined' && window.innerWidth >= 768) && (
            <div className={`rounded-xl p-4 sm:p-6 border bg-white text-black print-area relative`}>
              {/* Close button for mobile */}
              <div className="md:hidden absolute top-2 right-2">
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-1 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs cursor-pointer"
                >
                  <FaTimes />
                </button>
              </div>
  
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Live Preview</h3>
                <div className="flex gap-2">
                  <button
                    onClick={handleDownloadCoverLetter}
                    disabled={!coverLetterContent}
                    className="flex items-center gap-2 px-4 py-2 rounded-md bg-green-600 hover:bg-green-700 text-white text-sm cursor-pointer"
                  >
                    <FaDownload /> PDF
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm cursor-pointer"
                  >
                    <FaSave /> Save
                  </button>
                </div>
              </div>
              <div className="min-h-[80vh] prose max-w-none" dangerouslySetInnerHTML={{ __html: coverLetterContent }} />
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default CoverLetterGeneratorPage;
