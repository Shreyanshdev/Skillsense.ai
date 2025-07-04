import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
// Removed useRouter as it's specific to Next.js and not applicable in a standalone Canvas environment.
import {
  Target,
  Clock,
  Brain,
  Code,
  Palette,
  Database,
  Smartphone,
  Globe,
  ChevronRight,
  Sparkles,
  Zap,
  CheckCircle,
  Edit3,
  RefreshCw,
  Info
} from 'lucide-react';

interface GoalSetupProps {
  isDark?: boolean; // Optional prop for dark mode, useful for broader app themes
}

const GoalSetup: React.FC<GoalSetupProps> = ({ isDark = true }) => { // Default to dark for consistency with design
  // const router = useRouter(); // Removed Next.js router for Canvas environment compatibility
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    role: '',
    duration: 60,
    experience: 'beginner',
    customRole: '',
    github: '',
    linkedin: '',
    userKnowledge: ''
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  useEffect(() => {
    // Simulate component mounting and being ready
    setIsLoaded(true);
  }, []);

  // Configuration for various options with enhanced gradients
  const roles = [
    { id: 'frontend', name: 'Frontend Developer', icon: Code, color: 'from-blue-500 via-cyan-400 to-sky-300' },
    { id: 'backend', name: 'Backend Developer', icon: Database, color: 'from-green-500 via-emerald-400 to-teal-300' },
    { id: 'fullstack', name: 'Full Stack Developer', icon: Globe, color: 'from-purple-500 via-fuchsia-400 to-pink-300' },
    { id: 'mobile', name: 'Mobile Developer', icon: Smartphone, color: 'from-orange-500 via-red-400 to-rose-300' },
    { id: 'uiux', name: 'UI/UX Designer', icon: Palette, color: 'from-pink-500 via-rose-400 to-yellow-300' },
    { id: 'dsa', name: 'DSA Cracker', icon: Brain, color: 'from-indigo-500 via-violet-400 to-purple-300' },
  ];

  const durations = [
    { days: 30, label: '1 Month', description: 'Intensive pace' },
    { days: 60, label: '2 Months', description: 'Balanced approach' },
    { days: 90, label: '3 Months', description: 'Comprehensive study' },
    { days: 120, label: '4 Months', description: 'Deep dive & mastery' }
  ];

  const experienceLevels = [
    { id: 'beginner', label: 'Beginner', description: 'New to this field' },
    { id: 'intermediate', label: 'Intermediate', description: 'Some prior experience' },
    { id: 'advanced', label: 'Advanced', description: 'Looking to specialize' }
  ];

  // Handles the analysis process, simulating an AI call
  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    // Simulate network request or AI processing time
    setTimeout(() => {
      const hasGitHub = formData.github.trim().length > 0;
      const hasLinkedIn = formData.linkedin.trim().length > 0;

      // Mock analysis result based on form data
      const mockAnalysis = {
        summary: `You aim to become a ${formData.role} in ${formData.duration} days, starting at an ${formData.experience} level. ${formData.userKnowledge ? `You mentioned: "${formData.userKnowledge}". ` : ''}Based on this, I've generated a personalized roadmap.`,
        githubMessage: hasGitHub ? null : "It seems like you haven't provided a GitHub profile. I'll include steps to help you build a strong GitHub presence with proof-of-work projects.",
        linkedinMessage: hasLinkedIn ? null : "I didn't find a LinkedIn link — I'll guide you in optimizing your LinkedIn to increase your chances of getting noticed.",
        estimatedHours: Math.floor(formData.duration * 2.5) + (formData.experience === 'beginner' ? 20 : formData.experience === 'intermediate' ? 10 : 0),
        difficulty: formData.duration < 60 ? 'High' : formData.duration < 90 ? 'Medium' : 'Low',
        successRate: formData.duration < 60 ? '75%' : formData.duration < 90 ? '85%' : '95%',
        gapAnalysis: [
          'HTML/CSS fundamentals (Advanced)',
          'JavaScript ES6+ features (Deep Dive)',
          'React.js ecosystem (Mastery)',
          'State management (Context API & Redux)',
          'API integration (REST & GraphQL)',
          'Testing frameworks (Jest & React Testing Library)',
          'Deployment strategies (Netlify/Vercel)',
          'Version Control (Git & GitHub Flow)'
        ]
      };

      setAnalysisResult(mockAnalysis);
      setIsAnalyzing(false);
      setCurrentStep(3); // Move to the result step
    }, 3000);
  };

  // Handles accepting the roadmap and hypothetical navigation
  const handleAccept = () => {
    // In a real Next.js app, this would navigate to the roadmap page
    console.log("Roadmap accepted! Navigating to /roadmap");
    // router.push('/roadmap'); // This line was causing the error due to Next.js specific import
    alert("Roadmap accepted! (Navigation simulated)"); // Using alert for demo, replace with your actual navigation logic if not Next.js
  };

  // Handles editing the goal, returning to step 1
  const handleEdit = () => {
    setCurrentStep(1);
    setAnalysisResult(null); // Clear analysis result
  };

  // Handles re-analyzing, returning to step 2
  const handleReanalyze = () => {
    setAnalysisResult(null); // Clear analysis result
    setCurrentStep(2); // Go back to analysis step
  };

  // Variants for Framer Motion animations
  const containerVariants:Variants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.3, ease: "easeIn" } },
  };

  const itemVariants :Variants= {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  };

  const iconAnimation:any = {
    scale: [1, 1.1, 1], // Pulsating effect
    opacity: [0.8, 1, 0.8],
    transition: {
      duration: 2,
      ease: "easeInOut",
      repeat: Infinity,
      repeatType: "reverse",
      delay: Math.random() * 0.5, // Stagger effect
    },
  };

  return (
    // Main container with a dark background and subtle gradient
    <div className={`min-h-screen ${isDark ? 'bg-blend-luminosity' : 'bg-white'} flex items-center justify-center p-4 md:p-10 lg:p-20 relative overflow-hidden`}>
      {/* Background gradients for visual flair */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-purple-600 to-fuchsia-500 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-tr from-blue-500 via-cyan-400 to-emerald-400 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-gradient-to-bl from-pink-500 via-red-400 to-orange-300 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-blob animation-delay-4000"></div>

      {/* Glassmorphism main card container */}
      <motion.div
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={containerVariants}
        className={`relative max-w-5xl w-full mx-auto p-6 md:p-10 lg:p-12 rounded-3xl shadow-2xl-strong overflow-hidden
          ${isDark ? 'bg-gray-900/15 border-gray-700/50 text-white' : 'bg-white/20 border-gray-300/30 text-zinc-900'}
          backdrop-filter backdrop-blur-xl border border-opacity-70`}
      >
        <div className="text-center space-y-3 mb-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center gap-3 text-sky-400 text-3xl font-extrabold tracking-tight text-shadow-glow"
          >
            <Target className="w-8 h-8" /> Set Your Learning Goal
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-gray-200 text-xl font-medium"
          >
            We'll personalize a roadmap just for you — powered by cutting-edge AI ✨
          </motion.p>
        </div>

        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div
              key="step1"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-10"
            >
              {/* Role Selection */}
              <motion.div variants={itemVariants}>
                <h3 className="text-2xl font-bold mb-5 text-sky-300">1. Choose Your Path to Mastery</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {roles.map((role) => {
                    const Icon = role.icon;
                    return (
                      <motion.button
                        key={role.id}
                        onClick={() => setFormData({ ...formData, role: role.name })}
                        whileHover={{ scale: 1.03, boxShadow: '0 0 20px rgba(59, 130, 246, 0.6)' }}
                        whileTap={{ scale: 0.98 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                        className={`p-5 rounded-2xl border transition-all text-left flex flex-col items-start gap-3 relative overflow-hidden
                          ${formData.role === role.name
                            ? 'border-sky-500 bg-gradient-to-br from-sky-600/30 to-blue-700/30 transform scale-[1.01]'
                            : 'border-gray-700/60 hover:border-sky-500 bg-gray-800/40'
                          }`}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-transparent to-white/5 opacity-0 hover:opacity-10 transition-opacity duration-300"></div> {/* Subtle overlay effect */}
                        <motion.div
                          className={`w-14 h-14 rounded-xl bg-gradient-to-r ${role.color} flex items-center justify-center shadow-lg-glow`}
                          animate={iconAnimation} // Apply continuous icon animation
                        >
                          <Icon className="w-7 h-7 text-white" />
                        </motion.div>
                        <span className="font-semibold text-white text-lg">{role.name}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>

              {/* Custom Role Input */}
              <motion.div variants={itemVariants}>
                <input
                  type="text"
                  placeholder="Can't find your role? Enter a custom one (e.g., Blockchain Developer)..."
                  value={formData.customRole}
                  onChange={(e) => setFormData({ ...formData, customRole: e.target.value, role: e.target.value })}
                  className="w-full bg-gray-900/40 text-white border border-gray-700/60 rounded-xl px-5 py-3 placeholder-gray-400 focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all duration-300 text-lg"
                />
              </motion.div>

              {/* User Knowledge Prompt - Conditionally rendered */}
              <AnimatePresence>
                {formData.role && (formData.role !== formData.customRole || formData.customRole.trim() !== '') && (
                  <motion.div
                    key="knowledge-prompt"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="space-y-4"
                  >
                    <h3 className="text-2xl font-bold text-sky-300 flex items-center gap-3">
                      <Info className="w-6 h-6 text-sky-400" />
                      What's your current expertise in "{formData.role}"? (Optional, but helpful!)
                    </h3>
                    <textarea
                      value={formData.userKnowledge}
                      onChange={(e) => setFormData({ ...formData, userKnowledge: e.target.value })}
                      placeholder="e.g., 'I know basic HTML/CSS and some JavaScript fundamentals, but I'm new to React.' or 'I'm comfortable with Python and Django, looking to deepen my understanding of microservices.' Feel free to be detailed!"
                      rows={4}
                      className="w-full bg-gray-900/40 text-white border border-gray-700/60 rounded-xl px-5 py-3 placeholder-gray-400 focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all duration-300 resize-y text-lg"
                    />
                  </motion.div>
                )}
              </AnimatePresence>


              {/* Duration Selection */}
              <motion.div variants={itemVariants}>
                <h3 className="text-2xl font-bold mb-5 text-sky-300">2. Define Your Timeline</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {durations.map((duration) => (
                    <motion.button
                      key={duration.days}
                      onClick={() => setFormData({ ...formData, duration: duration.days })}
                      whileHover={{ scale: 1.03, boxShadow: '0 0 18px rgba(59, 130, 246, 0.5)' }}
                      whileTap={{ scale: 0.98 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.15 }}
                      className={`p-5 rounded-2xl border text-left relative overflow-hidden
                        ${formData.duration === duration.days
                          ? 'border-sky-500 bg-sky-600/20 transform scale-[1.01]'
                          : 'border-gray-700/60 hover:border-sky-500 bg-gray-800/40'
                        }`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-white/5 opacity-0 hover:opacity-10 transition-opacity duration-300"></div>
                      <Clock className="w-8 h-8 text-sky-400 mb-3" />
                      <p className="text-white font-bold text-xl">{duration.label}</p>
                      <p className="text-sm text-gray-300">{duration.description}</p>
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              {/* Experience Level Selection */}
              <motion.div variants={itemVariants}>
                <h3 className="text-2xl font-bold mb-5 text-sky-300">3. Your Starting Point</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {experienceLevels.map((level) => (
                    <motion.button
                      key={level.id}
                      onClick={() => setFormData({ ...formData, experience: level.id })}
                      whileHover={{ scale: 1.03, boxShadow: '0 0 18px rgba(59, 130, 246, 0.5)' }}
                      whileTap={{ scale: 0.98 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                      className={`p-5 rounded-2xl border relative overflow-hidden
                        ${formData.experience === level.id
                          ? 'border-sky-500 bg-sky-600/20 transform scale-[1.01]'
                          : 'border-gray-700/60 hover:border-sky-500 bg-gray-800/40'
                        }`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-white/5 opacity-0 hover:opacity-10 transition-opacity duration-300"></div>
                      <p className="text-white font-bold text-xl mb-2">{level.label}</p>
                      <p className="text-sm text-gray-300">{level.description}</p>
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              {/* Social Profile Inputs */}
              <motion.div variants={itemVariants}>
                <h3 className="text-2xl font-bold mb-5 text-sky-300">4. Boost Your Profile (Optional)</h3>
                <input
                  type="url"
                  value={formData.github}
                  onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                  placeholder="GitHub Profile URL (e.g., https://github.com/your-username)"
                  className="w-full bg-gray-900/40 text-white border border-gray-700/60 rounded-xl px-5 py-3 placeholder-gray-400 mb-4 focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all duration-300 text-lg"
                />
                <input
                  type="url"
                  value={formData.linkedin}
                  onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                  placeholder="LinkedIn Profile URL (e.g., https://linkedin.com/in/your-profile)"
                  className="w-full bg-gray-900/40 text-white border border-gray-700/60 rounded-xl px-5 py-3 placeholder-gray-400 focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all duration-300 text-lg"
                />
              </motion.div>

              {/* Continue Button */}
              <motion.button
                onClick={() => setCurrentStep(2)}
                disabled={!formData.role && !formData.customRole.trim()} // Disable if no role is selected/entered
                whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(59, 130, 246, 0.8)' }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.25 }}
                className="w-full bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-700 text-white py-4 rounded-xl font-extrabold text-xl hover:from-sky-400 hover:to-indigo-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg-button"
              >
                Let's Craft Your Roadmap!
                <ChevronRight className="w-7 h-7" />
              </motion.button>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="step2"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="text-center space-y-8 flex flex-col items-center justify-center min-h-[300px]"
            >
              <motion.h2
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-4xl font-extrabold text-sky-400 text-shadow-glow"
              >
                Analyzing your potential...
              </motion.h2>
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut", repeat: Infinity, repeatType: "mirror" }}
                className="inline-flex items-center gap-4 text-sky-400 text-2xl font-semibold"
              >
                <Zap className="w-10 h-10 animate-pulse" /> AI is diligently crafting your personalized roadmap!
              </motion.div>
              <motion.div
                className="w-24 h-24 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white text-xl font-bold shadow-lg-glow"
                animate={{ rotate: 360, scale: [1, 1.05, 1] }}
                transition={{ duration: 2.5, ease: "linear", repeat: Infinity }}
              >
                <Sparkles className="w-12 h-12 animate-spin-slow" />
              </motion.div>
            </motion.div>
          )}

          {currentStep === 3 && analysisResult && (
            <motion.div
              key="step3"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-10"
            >
              {/* AI Summary Section */}
              <motion.div variants={itemVariants} className="space-y-5 bg-gray-800/40 p-8 rounded-3xl border border-gray-700/50 shadow-inner-strong">
                <h2 className="text-3xl font-extrabold text-sky-400 text-shadow-glow">Your Personalized Roadmap Summary</h2>
                <p className="text-lg text-gray-200 leading-relaxed font-medium">{analysisResult.summary}</p>
                {analysisResult.githubMessage && <p className="text-orange-300 flex items-start gap-3 mt-4 text-md"><Info className="w-6 h-6 flex-shrink-0" /> {analysisResult.githubMessage}</p>}
                {analysisResult.linkedinMessage && <p className="text-pink-300 flex items-start gap-3 mt-2 text-md"><Info className="w-6 h-6 flex-shrink-0" /> {analysisResult.linkedinMessage}</p>}
              </motion.div>

              {/* Key Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                <motion.div variants={itemVariants} className="bg-sky-500/15 p-7 rounded-2xl border border-sky-500/50 shadow-md-glow text-center">
                  <h3 className="text-white font-bold mb-3 text-xl">Estimated Hours</h3>
                  <p className="text-5xl font-extrabold text-sky-300">{analysisResult.estimatedHours}h</p>
                </motion.div>
                <motion.div variants={itemVariants} className="bg-orange-500/15 p-7 rounded-2xl border border-orange-500/50 shadow-md-glow text-center">
                  <h3 className="text-white font-bold mb-3 text-xl">Difficulty</h3>
                  <p className="text-5xl font-extrabold text-orange-300">{analysisResult.difficulty}</p>
                </motion.div>
                <motion.div variants={itemVariants} className="bg-green-500/15 p-7 rounded-2xl border border-green-500/50 shadow-md-glow text-center">
                  <h3 className="text-white font-bold mb-3 text-xl">Success Rate</h3>
                  <p className="text-5xl font-extrabold text-green-300">{analysisResult.successRate}</p>
                </motion.div>
              </div>

              {/* Master Skills Section */}
              <motion.div variants={itemVariants} className="space-y-4 bg-gray-800/40 p-8 rounded-3xl border border-gray-700/50 shadow-inner-strong">
                <h3 className="text-3xl font-extrabold text-sky-400 text-shadow-glow">You'll Master These Key Skills:</h3>
                <ul className="list-none pl-0 space-y-3 text-gray-200">
                  {analysisResult.gapAnalysis.map((skill: string, idx: number) => (
                    <motion.li
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.05 }}
                      className="flex items-center gap-3 text-lg font-medium"
                    >
                      <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" /> {skill}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-5 justify-center pt-6">
                <motion.button
                  onClick={handleAccept}
                  whileHover={{ scale: 1.05, boxShadow: '0 0 25px rgba(59, 130, 246, 0.8)' }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-700 text-white px-8 py-4 rounded-xl font-extrabold text-lg flex items-center gap-3 shadow-lg-button hover:from-sky-400 hover:to-indigo-600 transition-all"
                >
                  <CheckCircle className="w-6 h-6" /> Accept & Start Learning Journey!
                </motion.button>
                <motion.button
                  onClick={handleEdit}
                  whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(107, 114, 128, 0.6)' }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  className="border border-gray-600/70 text-white px-8 py-4 rounded-xl font-semibold text-lg flex items-center gap-3 shadow-md hover:border-sky-500 transition-all bg-gray-800/40"
                >
                  <Edit3 className="w-6 h-6" /> Edit My Goal
                </motion.button>
                <motion.button
                  onClick={handleReanalyze}
                  whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(168, 85, 247, 0.6)' }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                  className="bg-purple-600/25 border border-purple-400/40 text-purple-300 px-8 py-4 rounded-xl font-semibold text-lg flex items-center gap-3 shadow-md hover:bg-purple-500/35 transition-all"
                >
                  <RefreshCw className="w-6 h-6" /> Re-analyze My Choices
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default GoalSetup;

