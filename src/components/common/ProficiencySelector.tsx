// src/components/common/ProficiencySelector.tsx
// Reusable component for selecting skill proficiency level

import React from 'react';
import { motion } from 'framer-motion';
import { FaStar, FaRegStar } from 'react-icons/fa';
import { PROFICIENCY_LEVELS } from '@/constants'; // Import proficiency levels
import { useSelector } from 'react-redux'; // Needed to access theme here
import { RootState } from '@/redux/store'; // Update path if needed


interface ProficiencySelectorProps {
    skillId: string; // ID of the skill this selector is for
    currentLevel: string | null; // The currently selected proficiency level ID
    onSelectLevel: (levelId: string) => void; // Handler for selecting a level
    onClose: () => void; // Handler to close the selector UI (used by parent)
}

const ProficiencySelector: React.FC<ProficiencySelectorProps> = ({ skillId, currentLevel, onSelectLevel }) => { // Removed onClose prop as selection handles closing
     const theme = useSelector((state: RootState) => state.theme.theme); // Access theme directly from Redux

     return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            // Added subtle border color animation based on theme
            className={`flex items-center flex-wrap gap-2 p-3 mt-2 rounded-md transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-600/50 border border-gray-500' : 'bg-gray-200/50 border border-gray-300'} w-full`}
        >
            <span className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Proficiency:</span>
            {PROFICIENCY_LEVELS.map(level => (
                <motion.button
                    key={level.id}
                    type="button"
                    onClick={() => onSelectLevel(level.id)}
                     // Added more vibrant hover/active colors for better feedback
                    className={`px-2 py-1 text-xs rounded-full border transition-colors duration-200 flex items-center space-x-1 ${
                        currentLevel === level.id
                            ? 'border-sky-500 bg-sky-500 text-white' // Selected state
                            : `${theme === 'dark' ? 'border-gray-500 text-gray-300 hover:border-sky-500 hover:text-sky-300 active:border-sky-600 active:text-sky-400' : 'border-gray-400 text-gray-600 hover:border-sky-600 hover:text-sky-600 active:border-sky-700 active:text-sky-700'}` // Default/Hover/Active states
                    }`}
                    whileHover={{ scale: 1.05 }} // Subtle scale on hover
                    whileTap={{ scale: 0.95 }} // Subtle scale on click
                >
                    {level.name}
                    <div className="flex text-yellow-500"> {/* Star icons */}
                        {[...Array(3)].map((_, i) => (
                            i < level.stars ? <FaStar key={i} size={10} /> : <FaRegStar key={i} size={10} />
                        ))}
                    </div>
                </motion.button>
            ))}
             {/* Close button removed - selection or parent state change will hide this */}
        </motion.div>
     );
};

export default ProficiencySelector;
