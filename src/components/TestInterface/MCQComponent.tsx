// src/components/TestInterface/MCQComponent.tsx
// Component to display and handle input for Multiple Choice Questions.

import React from 'react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store'; // Adjust path as needed

// Define props for the MCQComponent
interface MCQComponentProps {
    question: { // Specific structure for an MCQ question
        id: string;
        questionText: string;
        options: string[]; // MCQ must have options
    };
    userAnswer: string | null; // The user's currently selected answer (or null)
    onAnswerChange: (questionId: string, answer: string) => void; // Handler to update the answer in the parent
}

const MCQComponent: React.FC<MCQComponentProps> = ({ question, userAnswer, onAnswerChange }) => {
    const theme = useSelector((state: RootState) => state.theme.theme); // Get theme from Redux

    // Base class for the options container
    const optionsContainerClass = `space-y-3 p-4 rounded-md ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50/50'}`;

    // Class for individual option labels
    const optionLabelClass = `text-base cursor-pointer transition-colors duration-150 ${theme === 'dark' ? 'text-gray-200 hover:text-sky-300' : 'text-gray-800 hover:text-sky-600'}`;

    // Custom styling for radio buttons (optional, can be done via Tailwind config or custom CSS)
    // For simplicity, we'll add basic theme-based styling here or rely on default browser/Tailwind form styling
    const radioInputClass = `${theme === 'dark' ? 'form-radio-dark text-sky-500' : 'form-radio-light text-blue-600'} mr-2 focus:ring-sky-500`;


    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
        >
            {/* Question Text (Can be passed down or rendered in parent) */}
            {/* Keeping question text rendering in the parent (TestInterfacePage) is often better
                for consistent heading structure and speaker icon placement.
                This component focuses on the input method. */}
            {/* <h3 className={`text-xl font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>
                {question.questionText}
            </h3> */}

            {/* Options List */}
            <div className={optionsContainerClass}>
                 <p className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Select one option:</p>
                {question.options.map((option, index) => (
                    <motion.div
                        key={index} // Using index as key is acceptable here as options are static for a given question
                        className="flex items-center"
                         whileHover={{ x: 5 }} // Subtle hover animation on the option row
                    >
                        <input
                            type="radio"
                            id={`q${question.id}-option${index}`} // Unique ID for the radio button
                            name={`question-${question.id}`} // Same name for all radios in this group
                            value={option} // The value submitted when selected
                            checked={userAnswer === option} // Check if this option is the current user answer
                            onChange={(e) => onAnswerChange(question.id, e.target.value)} // Call parent handler on change
                            className={radioInputClass}
                        />
                        <label
                            htmlFor={`q${question.id}-option${index}`} // Link label to input
                            className={optionLabelClass}
                        >
                            {option}
                        </label>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
};

export default MCQComponent;
