// src/components/TestInterface/TheoryComponent.tsx
// Component to display and handle input for Theoretical Questions.

import React from 'react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store'; // Adjust path as needed

// Define props for the TheoryComponent
interface TheoryComponentProps {
    question: { // Specific structure for a Theoretical question
        id: string;
        questionText: string;
        // Theoretical questions don't have options or correctAnswer needed here
    };
    userAnswer: string | null; // The user's current text answer (or null)
    onAnswerChange: (questionId: string, answer: string) => void; // Handler to update the answer in the parent

    // Styling helper (passed as prop or imported)
    inputBaseClass: string;
}

const TheoryComponent: React.FC<TheoryComponentProps> = ({ question, userAnswer, onAnswerChange, inputBaseClass }) => {
    const theme = useSelector((state: RootState) => state.theme.theme); // Get theme from Redux

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

            {/* Answer Textarea */}
            <div className={`p-4 rounded-md ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50/50'}`}>
                 <p className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Your Answer:</p>
                <motion.textarea
                    placeholder="Type your answer here..."
                    rows={8} // Give more rows for theoretical answers
                    value={userAnswer || ''} // Use empty string if null for controlled component
                    onChange={(e) => onAnswerChange(question.id, e.target.value)} // Call parent handler on change
                    className={`w-full resize-y min-h-[150px] ${inputBaseClass}`} // Use inputBaseClass for styling
                     whileFocus={{ borderColor: theme === 'dark' ? '#0ea5e9' : '#0284c7' }} // Subtle focus animation
                ></motion.textarea>
            </div>
        </motion.div>
    );
};

export default TheoryComponent;
