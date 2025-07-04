// src/components/ResumeEditor/PersonalInfo.tsx
'use client';

import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store';
import { updatePersonalInfo } from '@/redux/slices/resumeSlice';
import { motion } from 'framer-motion';

const PersonalInfo = () => {
  const dispatch: AppDispatch = useDispatch();
  const personalInfo = useSelector((state: RootState) => state.resume.resumeData.personalInfo);
  const theme = useSelector((state: RootState) => state.theme.theme);
  const isDark = theme === 'dark';

  // Dynamic classes
  const formSectionBg = isDark ? 'bg-gray-800/80 border-gray-700 shadow-xl backdrop-blur-sm' : 'bg-gray-50 border-gray-200 shadow-sm';
  const labelColor = isDark ? 'text-gray-300' : 'text-gray-700';
  const inputBg = isDark ? 'bg-gray-700' : 'bg-white';
  const inputBorder = isDark ? 'border-gray-600' : 'border-gray-300';
  const inputTextColor = isDark ? 'text-gray-100' : 'text-gray-900';
  const inputPlaceholderColor = isDark ? 'placeholder-gray-400' : 'placeholder-gray-500';
  const inputFocusRing = isDark ? 'focus:ring-red-700 focus:border-red-700' : 'focus:ring-red-500 focus:border-red-500';
  const infoTextColor = isDark ? 'text-gray-400' : 'text-gray-500';
  const headerColor = isDark ? 'text-gray-100' : 'text-gray-800';
  const subHeaderColor = isDark ? 'text-gray-300' : 'text-gray-600';
  const photoContainerBg = isDark ? 'bg-gray-800 border-gray-600' : 'bg-gray-100 border-gray-300';
  const noPhotoText = isDark ? 'text-gray-500' : 'text-gray-500';
  const fileInputColors = isDark ? 'file:bg-red-700 file:text-white hover:file:bg-red-800' : 'file:bg-red-50 file:text-red-700 hover:file:bg-red-100';


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    dispatch(updatePersonalInfo({ [name]: value }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        dispatch(updatePersonalInfo({ photoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    } else {
        dispatch(updatePersonalInfo({ photoUrl: '' }));
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className={`text-3xl font-extrabold mb-2 ${headerColor}`}>Personal Information</h2>
        <p className={`text-md ${subHeaderColor}`}>
          Tell us about yourself. This information will appear at the top of your resume.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`p-6 rounded-lg transition-colors duration-300 space-y-5 ${formSectionBg}`}
      >
        {/* Photo Upload */}
        <div className={`flex flex-col items-center justify-center space-y-4 p-4 rounded-md ${photoContainerBg} border border-dashed transition-colors duration-300`}>
          {personalInfo.photoUrl ? (
            <motion.img
              src={personalInfo.photoUrl}
              alt="Your Photo"
              className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
          ) : (
            <div className={`w-32 h-32 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium ${noPhotoText}`}>
              No Photo
            </div>
          )}
          <label htmlFor="photoUpload" className={`block text-sm font-medium ${labelColor}`}>
            Your Photo (Optional)
          </label>
          <input
            type="file"
            id="photoUpload"
            name="photoUpload"
            accept="image/*"
            onChange={handlePhotoUpload}
            className={`block w-full text-sm ${infoTextColor}
                       file:mr-4 file:py-2 file:px-4
                       file:rounded-full file:border-0
                       file:text-sm file:font-semibold
                       ${fileInputColors} cursor-pointer transition-colors duration-300`}
          />
          <p className={`mt-1 text-xs ${infoTextColor}`}>
            Upload a professional headshot. Max 2MB. (Currently stores a temporary URL)
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Name */}
          <div>
            <label htmlFor="name" className={`block text-sm font-medium mb-1 ${labelColor}`}>
              Your Full Name
            </label>
            <motion.input
              type="text"
              id="name"
              name="name"
              value={personalInfo.name}
              onChange={handleChange}
              placeholder="e.g., Jane Doe"
              className={`mt-1 block w-full px-4 py-2 border rounded-md shadow-sm sm:text-sm transition duration-150 ease-in-out ${inputBg} ${inputBorder} ${inputTextColor} ${inputPlaceholderColor} ${inputFocusRing}`}
              whileFocus={{ scale: 1.01, boxShadow: isDark ? "0 0 0 3px rgba(220, 38, 38, 0.5)" : "0 0 0 3px rgba(239, 68, 68, 0.2)" }}
            />
          </div>

          {/* Job Title */}
          <div>
            <label htmlFor="jobTitle" className={`block text-sm font-medium mb-1 ${labelColor}`}>
              Job Title / Profession
            </label>
            <motion.input
              type="text"
              id="jobTitle"
              name="jobTitle"
              value={personalInfo.jobTitle}
              onChange={handleChange}
              placeholder="e.g., Senior Software Engineer"
              className={`mt-1 block w-full px-4 py-2 border rounded-md shadow-sm sm:text-sm transition duration-150 ease-in-out ${inputBg} ${inputBorder} ${inputTextColor} ${inputPlaceholderColor} ${inputFocusRing}`}
              whileFocus={{ scale: 1.01, boxShadow: isDark ? "0 0 0 3px rgba(220, 38, 38, 0.5)" : "0 0 0 3px rgba(239, 68, 68, 0.2)" }}
            />
          </div>

          {/* City */}
          <div>
            <label htmlFor="city" className={`block text-sm font-medium mb-1 ${labelColor}`}>
              City, State (Optional)
            </label>
            <motion.input
              type="text"
              id="city"
              name="city"
              value={personalInfo.city}
              onChange={handleChange}
              placeholder="e.g., San Francisco, CA"
              className={`mt-1 block w-full px-4 py-2 border rounded-md shadow-sm sm:text-sm transition duration-150 ease-in-out ${inputBg} ${inputBorder} ${inputTextColor} ${inputPlaceholderColor} ${inputFocusRing}`}
              whileFocus={{ scale: 1.01, boxShadow: isDark ? "0 0 0 3px rgba(220, 38, 38, 0.5)" : "0 0 0 3px rgba(239, 68, 68, 0.2)" }}
            />
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className={`block text-sm font-medium mb-1 ${labelColor}`}>
              Phone Number
            </label>
            <motion.input
              type="tel"
              id="phone"
              name="phone"
              value={personalInfo.phone}
              onChange={handleChange}
              placeholder="e.g., +1 (555) 123-4567"
              className={`mt-1 block w-full px-4 py-2 border rounded-md shadow-sm sm:text-sm transition duration-150 ease-in-out ${inputBg} ${inputBorder} ${inputTextColor} ${inputPlaceholderColor} ${inputFocusRing}`}
              whileFocus={{ scale: 1.01, boxShadow: isDark ? "0 0 0 3px rgba(220, 38, 38, 0.5)" : "0 0 0 3px rgba(239, 68, 68, 0.2)" }}
            />
          </div>

          {/* Email */}
          <div className="md:col-span-2">
            <label htmlFor="email" className={`block text-sm font-medium mb-1 ${labelColor}`}>
              Email Address
            </label>
            <motion.input
              type="email"
              id="email"
              name="email"
              value={personalInfo.email}
              onChange={handleChange}
              placeholder="e.g., jane.doe@example.com"
              className={`mt-1 block w-full px-4 py-2 border rounded-md shadow-sm sm:text-sm transition duration-150 ease-in-out ${inputBg} ${inputBorder} ${inputTextColor} ${inputPlaceholderColor} ${inputFocusRing}`}
              whileFocus={{ scale: 1.01, boxShadow: isDark ? "0 0 0 3px rgba(220, 38, 38, 0.5)" : "0 0 0 3px rgba(239, 68, 68, 0.2)" }}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PersonalInfo;