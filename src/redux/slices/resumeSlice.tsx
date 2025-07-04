// src/redux/slices/resumeSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid'; // Import uuid for generating unique IDs

// --- Type Definitions ---

export interface GeneralInfo {
    resumeTitle: string; // Renamed from projectName
    resumeDescription: string; // Renamed from description
  linkedin: string; // ADD THIS LINE
  github: string;   // ADD THIS LINE
  portfolio: string;

}

export interface PersonalInfo {
  name: string;
  jobTitle: string;
  city: string;
  phone: string;
  email: string;
  photoUrl: string; // URL for the uploaded photo
}

export interface AchievementActivity {
    id: string;
    description: string;
  }

export interface EducationEntry {
  id: string; // Unique ID for each entry
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string; // Or 'Present'
  description?: string;
}

export interface ExperienceEntry {
  id: string; // Unique ID for each entry
  company: string;
  jobTitle: string;
  startDate: string;
  endDate: string; // Or 'Present'
  responsibilities: string[]; // Array of bullet points
}

export interface ProjectEntry {
    id: string;
    name: string;
    githubLink?: string;
    liveLink?: string;
    bulletPoints: string[]; // For project responsibilities/achievements
  }

export interface Skill {
  id: string;
  name: string;
  level?: string; // e.g., 'Beginner', 'Intermediate', 'Expert'
  category?: string;
}

// Define the core resume content structure
export interface ResumeContent {
  generalInfo: GeneralInfo;
  personalInfo: PersonalInfo;
  education: EducationEntry[];
  experience: ExperienceEntry[];
  skills: Skill[];
  summary: string;
  achievementsActivities: AchievementActivity[];
  projects: ProjectEntry[]; // ADD THIS NEW SECTION
}

// Define the overall Resume State, including metadata and UI states
export interface ResumeState {
  id: string | null; // Unique ID for the resume document (for saving/loading)
  title: string; // A user-friendly title for the resume (e.g., "John Doe - Software Engineer")
  createdAt: string | null; // ISO string date
  lastModified: string | null; // ISO string date
  templateId: string; // ID of the chosen template (e.g., 'modern', 'classic')
  currentStep: number; // 0: GeneralInfo, 1: PersonalInfo, 2: Education, etc.
  sections: string[]; // List of section names for breadcrumbs/navigation
  resumeData: ResumeContent; // All actual resume content
  isLoadingAI: boolean; // State for AI generation
  errorAI: string | null; // Error message from AI generation
  isSaving: boolean; // Global saving indicator
  saveError: string | null; // Error message during save
}

// --- Initial States ---

// Represents a completely blank resume content
export const blankResumeContent: ResumeContent = {
  generalInfo: {
    resumeTitle: '', // Renamed
    resumeDescription: '', // Renamed
    linkedin: '', // ADD THIS LINE for initial blank state
    github: '',   // ADD THIS LINE for initial blank state
    portfolio: '',
  },
  personalInfo: {
    name: '',
    jobTitle: '',
    city: '',
    phone: '',
    email: '',
    photoUrl: '',
  },
  education: [],
  experience: [],
  skills: [],
  summary: '',
  achievementsActivities: [],
  projects: [], // INITIALIZE NEW SECTION
};

// Initial state for the entire resume slice, ready for a new, unsaved resume
const initialState: ResumeState = {
  id: null, // No ID until saved for the first time
  title: 'Untitled Resume', // Default title
  createdAt: null,
  lastModified: null,
  templateId: 'default', // Default template ID
  currentStep: 0,
  sections: [
    'General Info',
    'Personal Info',
    'Education',
    'Experience',
    'Skills',
    'Projects',
    'Extra Activity',
    'Summary',
  ],
  resumeData: blankResumeContent,
  isLoadingAI: false,
  errorAI: null,
  isSaving: false,
  saveError: null,
};

// --- Resume Slice ---

const resumeSlice = createSlice({
  name: 'resume',
  initialState,
  reducers: {
    // --- Core Navigation ---
    nextStep: (state) => {
      if (state.currentStep < state.sections.length - 1) {
        state.currentStep += 1;
      }
    },
    prevStep: (state) => {
      if (state.currentStep > 0) {
        state.currentStep -= 1;
      }
    },
    goToStep: (state, action: PayloadAction<number>) => {
      if (action.payload >= 0 && action.payload < state.sections.length) {
        state.currentStep = action.payload;
      }
    },


    // Initializes state for a brand new resume
    createNewResume: (state) => {
      state.id = uuidv4(); // Generate a new unique ID
      state.title = 'New Resume ' + new Date().toLocaleDateString(); // Dynamic default title
      state.createdAt = new Date().toISOString();
      state.lastModified = new Date().toISOString();
      state.templateId = 'default'; // Ensure default template is set
      state.currentStep = 0;
      state.resumeData = blankResumeContent; // Reset all data to blank
      state.isLoadingAI = false;
      state.errorAI = null;
      state.isSaving = false;
      state.saveError = null;
    },

    // Loads a full resume state from an external source (e.g., localStorage, API)
    loadResume: (state, action: PayloadAction<ResumeState>) => {
      // Ensure the loaded resume has an ID, create one if missing (e.g., legacy data)
      state.id = action.payload.id || uuidv4();
      state.title = action.payload.title || 'Untitled Resume';
      state.createdAt = action.payload.createdAt || new Date().toISOString();
      state.lastModified = action.payload.lastModified || new Date().toISOString();
      state.templateId = action.payload.templateId || 'default';
      state.currentStep = action.payload.currentStep || 0; // Optionally reset to 0 or keep last step
      state.sections = action.payload.sections || initialState.sections; // Ensure sections are present
      state.resumeData = action.payload.resumeData;
      state.isLoadingAI = false; // Reset UI states on load
      state.errorAI = null;
      state.isSaving = false;
      state.saveError = null;
    },

    // Updates the resume's title
    updateResumeTitle: (state, action: PayloadAction<string>) => {
      state.title = action.payload;
      state.lastModified = new Date().toISOString();
    },

    // Sets the active template
    setTemplate: (state, action: PayloadAction<string>) => {
      state.templateId = action.payload;
      state.lastModified = new Date().toISOString();
    },

    // --- Data Updates ---

    updateGeneralInfo: (state, action: PayloadAction<Partial<GeneralInfo>>) => {
      state.resumeData.generalInfo = { ...state.resumeData.generalInfo, ...action.payload };
      state.lastModified = new Date().toISOString();
    },
    updatePersonalInfo: (state, action: PayloadAction<Partial<PersonalInfo>>) => {
      state.resumeData.personalInfo = { ...state.resumeData.personalInfo, ...action.payload };
      state.lastModified = new Date().toISOString();
    },
    // Add Education Entry (now with UUID)
    addEducation: (state, action: PayloadAction<Omit<EducationEntry, 'id'>>) => {
      state.resumeData.education.push({ ...action.payload, id: uuidv4() });
      state.lastModified = new Date().toISOString();
    },
    updateEducation: (state, action: PayloadAction<EducationEntry>) => {
      const index = state.resumeData.education.findIndex(edu => edu.id === action.payload.id);
      if (index !== -1) {
        state.resumeData.education[index] = action.payload;
      }
      state.lastModified = new Date().toISOString();
    },
    removeEducation: (state, action: PayloadAction<string>) => { // action.payload is the ID
      state.resumeData.education = state.resumeData.education.filter(edu => edu.id !== action.payload);
      state.lastModified = new Date().toISOString();
    },
    // Add Experience Entry (now with UUID)
    addExperience: (state, action: PayloadAction<Omit<ExperienceEntry, 'id'>>) => {
      state.resumeData.experience.push({ ...action.payload, id: uuidv4() });
      state.lastModified = new Date().toISOString();
    },
    updateExperience: (state, action: PayloadAction<ExperienceEntry>) => {
      const index = state.resumeData.experience.findIndex(exp => exp.id === action.payload.id);
      if (index !== -1) {
        state.resumeData.experience[index] = action.payload;
      }
      state.lastModified = new Date().toISOString();
    },
    removeExperience: (state, action: PayloadAction<string>) => { // action.payload is the ID
      state.resumeData.experience = state.resumeData.experience.filter(exp => exp.id !== action.payload);
      state.lastModified = new Date().toISOString();
    },
    // Add Skill (now with UUID)
    addSkill: (state, action: PayloadAction<Omit<Skill, 'id'>>) => {
      state.resumeData.skills.push({ ...action.payload, id: uuidv4() });
      state.lastModified = new Date().toISOString();
    },
    updateSkill: (state, action: PayloadAction<Skill>) => {
      const index = state.resumeData.skills.findIndex(skill => skill.id === action.payload.id);
      if (index !== -1) {
        state.resumeData.skills[index] = action.payload;
      }
      state.lastModified = new Date().toISOString();
    },
    removeSkill: (state, action: PayloadAction<string>) => { // action.payload is the ID
      state.resumeData.skills = state.resumeData.skills.filter(skill => skill.id !== action.payload);
      state.lastModified = new Date().toISOString();
    },
    updateSummary: (state, action: PayloadAction<string>) => {
      state.resumeData.summary = action.payload;
      state.lastModified = new Date().toISOString();
    },
    // Add/Remove Responsibility for a specific experience entry
    addResponsibility: (state, action: PayloadAction<{ experienceId: string; responsibility: string }>) => {
      const exp = state.resumeData.experience.find(e => e.id === action.payload.experienceId);
      if (exp && action.payload.responsibility.trim() !== '') {
        exp.responsibilities.push(action.payload.responsibility);
        state.lastModified = new Date().toISOString();
      }
    },
    updateResponsibility: (state, action: PayloadAction<{ experienceId: string; index: number; newResponsibility: string }>) => {
      const exp = state.resumeData.experience.find(e => e.id === action.payload.experienceId);
      if (exp && action.payload.index >= 0 && action.payload.index < exp.responsibilities.length) {
        exp.responsibilities[action.payload.index] = action.payload.newResponsibility;
        state.lastModified = new Date().toISOString();
      }
    },
    removeResponsibility: (state, action: PayloadAction<{ experienceId: string; index: number }>) => {
      const exp = state.resumeData.experience.find(e => e.id === action.payload.experienceId);
      if (exp && action.payload.index >= 0 && action.payload.index < exp.responsibilities.length) {
        exp.responsibilities.splice(action.payload.index, 1);
        state.lastModified = new Date().toISOString();
      }
    },

    // --- AI Integration Status ---
    setAILoading: (state, action: PayloadAction<boolean>) => {
      state.isLoadingAI = action.payload;
      if (action.payload) { // Clear error when loading starts
        state.errorAI = null;
      }
    },
    setAIError: (state, action: PayloadAction<string | null>) => {
      state.errorAI = action.payload;
      state.isLoadingAI = false; // Ensure loading stops if there's an error
    },
    // (Future) Action to populate resume data from AI response
    populateFromAI: (state, action: PayloadAction<Partial<ResumeContent>>) => {
      // This action would merge AI-generated data into the existing resumeData
      // You'd need to carefully define how merging happens (e.g., append skills, overwrite summary)
      state.resumeData = {
        ...state.resumeData,
        ...action.payload,
        // Example: if AI generates a summary, overwrite it
        summary: action.payload.summary || state.resumeData.summary,
        // Example: if AI suggests new skills, append them
        skills: action.payload.skills ? [...state.resumeData.skills, ...action.payload.skills.map(s => ({...s, id: uuidv4()}))] : state.resumeData.skills,
        // ... and so on for other sections, possibly requiring more complex merging logic
      };
      state.isLoadingAI = false;
      state.errorAI = null;
      state.lastModified = new Date().toISOString();
    },

    // --- Saving Status ---
    setSavingStatus: (state, action: PayloadAction<boolean>) => {
      state.isSaving = action.payload;
      if (action.payload) { // Clear save error when saving starts
        state.saveError = null;
      }
    },
    setSaveError: (state, action: PayloadAction<string | null>) => {
      state.saveError = action.payload;
      state.isSaving = false; // Ensure saving stops if there's an error
    },
    // Add Achievement/Activity Entry
    addAchievementActivity: (state, action: PayloadAction<Omit<AchievementActivity, 'id'>>) => {
        state.resumeData.achievementsActivities.push({ ...action.payload, id: uuidv4() });
        state.lastModified = new Date().toISOString();
      },
      // Update an existing Achievement/Activity Entry
      updateAchievementActivity: (state, action: PayloadAction<AchievementActivity>) => {
        const index = state.resumeData.achievementsActivities.findIndex(
          (item) => item.id === action.payload.id
        );
        if (index !== -1) {
          state.resumeData.achievementsActivities[index] = action.payload;
        }
        state.lastModified = new Date().toISOString();
      },
      // Remove Achievement/Activity Entry
      removeAchievementActivity: (state, action: PayloadAction<string>) => {
        state.resumeData.achievementsActivities = state.resumeData.achievementsActivities.filter(
          (item) => item.id !== action.payload
        );
        state.lastModified = new Date().toISOString();
      },

       // Add Project Entry
    addProject: (state, action: PayloadAction<Omit<ProjectEntry, 'id'>>) => {
        state.resumeData.projects.push({ ...action.payload, id: uuidv4() });
        state.lastModified = new Date().toISOString();
      },
      // Update an existing Project Entry
      updateProject: (state, action: PayloadAction<ProjectEntry>) => {
        const index = state.resumeData.projects.findIndex(
          (item) => item.id === action.payload.id
        );
        if (index !== -1) {
          state.resumeData.projects[index] = action.payload;
        }
        state.lastModified = new Date().toISOString();
      },
      // Remove Project Entry
      removeProject: (state, action: PayloadAction<string>) => {
        state.resumeData.projects = state.resumeData.projects.filter(
          (item) => item.id !== action.payload
        );
        state.lastModified = new Date().toISOString();
      },
      // Add Project Bullet Point
      addProjectBulletPoint: (state, action: PayloadAction<{ projectId: string; point: string }>) => {
        const project = state.resumeData.projects.find(p => p.id === action.payload.projectId);
        if (project) {
          project.bulletPoints.push(action.payload.point);
          state.lastModified = new Date().toISOString();
        }
      },
      // Update Project Bullet Point
      updateProjectBulletPoint: (state, action: PayloadAction<{ projectId: string; index: number; point: string }>) => {
        const project = state.resumeData.projects.find(p => p.id === action.payload.projectId);
        if (project && project.bulletPoints[action.payload.index] !== undefined) {
          project.bulletPoints[action.payload.index] = action.payload.point;
          state.lastModified = new Date().toISOString();
        }
      },
      // Remove Project Bullet Point
      removeProjectBulletPoint: (state, action: PayloadAction<{ projectId: string; index: number }>) => {
        const project = state.resumeData.projects.find(p => p.id === action.payload.projectId);
        if (project) {
          project.bulletPoints.splice(action.payload.index, 1);
          state.lastModified = new Date().toISOString();
        }
      },
  },
});

export const {
  nextStep,
  prevStep,
  goToStep,
  createNewResume, // New action
  loadResume,      // Updated to load full ResumeState
  updateResumeTitle, // New action
  setTemplate,     // New action
  updateGeneralInfo,
  updatePersonalInfo,
  addEducation,
  updateEducation,
  removeEducation,
  addExperience,
  updateExperience,
  removeExperience,
  addSkill,
  updateSkill,
  removeSkill,
  updateSummary,
  addResponsibility, // New actions for responsibilities
  updateResponsibility,
  removeResponsibility,
  setAILoading,
  setAIError,
  populateFromAI, // New AI action
  setSavingStatus, // New saving actions
  setSaveError,
  addAchievementActivity,
  updateAchievementActivity,
  removeAchievementActivity,
  addProject,
  updateProject,
  removeProject,
  addProjectBulletPoint,
  updateProjectBulletPoint,
  removeProjectBulletPoint,
} = resumeSlice.actions;

export default resumeSlice.reducer;