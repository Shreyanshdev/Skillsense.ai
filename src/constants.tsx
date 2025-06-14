// constants.ts
import { FaCode, FaUserTie, FaLightbulb, FaUserGraduate, FaRocket,FaSignOutAlt, FaClock, FaUserClock, FaHourglassHalf, FaStar, FaRegStar, FaBriefcase, FaBullseye, FaChartBar } from 'react-icons/fa';
import { FiFileText, FiSettings , FiEdit3 } from 'react-icons/fi';


export const SKILL_OPTIONS = [
  { id: 'react', name: 'React.js', icon: <FaCode /> },
  { id: 'nextjs', name: 'Next.js', icon: <FaCode /> },
  { id: 'typescript', name: 'TypeScript', icon: <FaCode /> },
  { id: 'python', name: 'Python', icon: <FaCode /> },
  { id: 'nodejs', name: 'Node.js', icon: <FaCode /> },
  { id: 'tailwind', name: 'Tailwind CSS', icon: <FaCode /> },
];

export const  SuggestedSkill  = [
  { id: 'vue', name: 'Vue.js', icon: <FaCode /> },
  { id: 'angular', name: 'Angular', icon: <FaCode /> },
  { id: 'graphql', name: 'GraphQL', icon: <FaCode /> },
  { id: 'docker', name: 'Docker', icon: <FaCode /> },
  { id: 'kubernetes', name: 'Kubernetes', icon: <FaCode /> },
]

export const ROLE_OPTIONS = [
  { id: 'frontend', name: 'Frontend Developer', icon: <FaUserTie /> },
  { id: 'backend', name: 'Backend Developer', icon: <FaUserTie /> },
  { id: 'fullstack', name: 'Full-Stack Developer', icon: <FaUserTie /> },
];

export const EXPERIENCE_LEVELS = [
  { id: 'intern', name: 'Intern/Trainee', icon: <FaUserGraduate /> },
  { id: 'junior', name: 'Junior (0-2 yrs)', icon: <FaUserGraduate /> },
  { id: 'mid', name: 'Mid-Level (2-5 yrs)', icon: <FaUserGraduate /> },
];


export const PROFICIENCY_LEVELS = [
  { id: 'familiar', name: 'Familiar', stars: 1 },
  { id: 'proficient', name: 'Proficient', stars: 2 },
  { id: 'expert', name: 'Expert', stars: 3 },
];

// Configuration for the horizontal tabs (or sidebar steps if using that layout)
export const TABS_CONFIG = [
  { name: "Focus", id: "focus", icon: <FaLightbulb /> },
  { name: "Details", id: "details", icon: <FiFileText /> },
  { name: "Preferences", id: "preferences", icon: <FiSettings /> }
];


// Sidebar steps for the evaluation form
export const SIDEBAR_STEPS = [
  { name: "Evaluation", id: "evaluation", icon: <FaLightbulb /> }, // Renamed and updated ID
  { name: "Goal Tracker", id: "goal-tracker", icon: <FaBullseye /> }, // Placeholder
  { name: "Dashboard", id: "dashboard", icon: <FaChartBar /> }, // Placeholder
  // The form steps (Focus, Details, Preferences) will be internal to the Evaluation page component
];

// Define type for sidebar step
export interface SidebarStep {
  name: string;
  id: string;
  icon: React.ReactNode;
}

// Define type for selected skill with proficiency
export interface SelectedSkill {
    name: any;
    id: string;
    level: string | null;
}