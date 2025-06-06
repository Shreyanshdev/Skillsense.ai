'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Editor from '@monaco-editor/react';
import {
  FaPlay, FaSpinner, FaTerminal, FaFileCode,
  FaChevronRight, FaChevronDown, FaRegCopy, FaRegSave,
  FaFlag, FaCheckCircle, FaTimesCircle, FaInfoCircle, FaVolumeUp,
  FaTools // For compile icon
} from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { toast } from 'sonner';
import type { editor } from 'monaco-editor';
import Markdown from 'react-markdown';

// Define the structure for test case results received from backend
interface BackendTestCaseResult {
  input: string;
  expectedOutput: string; // The expected output from the question data
  actualOutput: string;
  passed: boolean;
  error?: string; // Optional: runtime error for this specific test case
}

// Define the full response structure from your backend's code execution endpoint
interface CodeExecutionResponse {
  success: boolean;
  compileOutput: string; // Full compilation stdout/stderr
  runtimeOutput: string; // Combined runtime stdout (e.g., print statements)
  executionTimeMs: number;
  memoryUsedKB: number;
  results: BackendTestCaseResult[]; // Array of results for each test case
  errorMessage?: string; // General error message if the entire execution failed (e.g., server error)
  isCompilationError: boolean; // True if compilation failed
  isRuntimeError: boolean; // True if any test case had a runtime error
}

// Define the structure for test case results displayed in the UI
interface UITestCaseResult {
  input: string;
  expectedOutput: string;
  actualOutput: string | null;
  passed: boolean | null; // null for not run, boolean for pass/fail
  error: string | null; // Error message if execution failed for this case
}

// Define the shape of the question prop
interface CodingQuestion {
  id: string;
  type: 'coding-challenge';
  questionText: string; // This is the main question description
  starterCode: string;
  language: string;
  documentation?: string; // Additional documentation for the question (e.g., constraints, examples)
  testCases?: { input: string; output: string }[]; // Public test cases to be shown/run against
}

interface CodingComponentProps {
  question: CodingQuestion;
  userAnswer: string;
  onAnswerChange: (questionId: string, answer: string) => void;
  theme: 'light' | 'dark';
  isFlagged: boolean;
  onToggleFlag: () => void;
}

const CodingComponent: React.FC<CodingComponentProps> = ({
  question,
  userAnswer,
  onAnswerChange,
  theme,
  isFlagged,
  onToggleFlag,
}) => {
  const [code, setCode] = useState(userAnswer || question.starterCode);
  const [output, setOutput] = useState<string | null>(null); // Console output from compiler/runtime
  const [testCaseResults, setTestCaseResults] = useState<UITestCaseResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState('output'); // Default to output tab after execution
  const [isCompiling, setIsCompiling] = useState(false); // State for compilation process

  // Supported languages (mapping to common judge system identifiers)
  // Ensure your backend supports these language identifiers
  const languages = useMemo(() => [
    { value: 'javascript', label: 'JavaScript' }, // For Node.js execution
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' },
  ], []);

  const [selectedLanguage, setSelectedLanguage] = useState(question.language || 'javascript');

  // Base URL for your backend API
  // IMPORTANT: Replace with your actual backend URL!
  const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_CODE_EXECUTION_URL || 'http://localhost:3001/api/execute-code';


  // Sync local code state with parent userAnswer and question starter code
  useEffect(() => {
    // Only update local code if userAnswer is explicitly different or null/undefined/empty
    // This prevents infinite loops if onAnswerChange causes a re-render with the same code
    if (userAnswer === null || userAnswer === undefined || userAnswer === '') {
        if (code !== question.starterCode) { // Only update if it's actually different
            setCode(question.starterCode);
        }
    } else if (userAnswer !== code) {
        setCode(userAnswer);
    }
  }, [userAnswer, question.starterCode, code]);

  // Initialize test case results for UI display when question or its test cases change
  useEffect(() => {
    if (question.testCases && question.testCases.length > 0) {
      setTestCaseResults(question.testCases.map(tc => ({
        input: tc.input,
        expectedOutput: tc.output,
        actualOutput: null,
        passed: null,
        error: null,
      })));
      setActiveTab('test-cases'); // Automatically switch to test cases tab if they exist
    } else {
      setTestCaseResults([]);
      setActiveTab('output'); // Fallback to output if no test cases
    }
  }, [question.testCases, question.id]); // Add question.id to dependencies to re-initialize on question change


  // Handler for Monaco Editor changes
  const handleEditorChange = useCallback((value?: string) => {
    const newCode = value || '';
    setCode(newCode);
    // Debounce this call in a real app if `onAnswerChange` saves to backend
    // For now, it updates parent state directly for quick feedback
    onAnswerChange(question.id, newCode);
  }, [onAnswerChange, question.id]);

  // Generic function to send code to backend
  const executeCodeOnBackend = useCallback(async (
      codeToExecute: string,
      language: string,
      testInputs: { input: string; output: string }[] // Includes expected output for comparison on backend
  ): Promise<CodeExecutionResponse | null> => {
      try {
          const response = await fetch(BACKEND_API_URL, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                  code: codeToExecute,
                  language: language,
                  testCases: testInputs,
                  // Add any other necessary data like questionId, userId, etc.
                  questionId: question.id,
              }),
          });

          if (!response.ok) {
              const errorBody = await response.json().catch(() => ({ message: 'Server error' }));
              throw new Error(errorBody.message || 'Failed to execute code on backend.');
          }

          const data: CodeExecutionResponse = await response.json();
          return data;

      } catch (error: any) {
          console.error('Error communicating with code execution backend:', error);
          toast.error(`Backend communication error: ${error.message}`);
          return null;
      }
  }, [BACKEND_API_URL, question.id]); // Dependencies for useCallback


  // Handle compilation request
  const handleCompileCode = useCallback(async () => {
      if (isCompiling || isRunning) return;

      setIsCompiling(true);
      setOutput('Compiling code...\n');
      setActiveTab('output');
      setTestCaseResults(prev => prev.map(tc => ({ ...tc, actualOutput: null, passed: null, error: null }))); // Clear previous results

      try {
          // For a 'compile only' endpoint, you might send an empty testCases array
          // or have a dedicated '/api/compile-code' endpoint.
          // For simplicity, we'll use the same '/api/execute-code' and just check compileOutput.
          const response = await executeCodeOnBackend(code, selectedLanguage, []); // Send empty test cases for compile-only

          if (response) {
              // Display compilation output
              setOutput(response.compileOutput || 'Compilation completed.\n');
              if (response.isCompilationError) {
                  toast.error('Compilation failed. Check output tab.');
              } else {
                  toast.success('Compilation successful!');
              }
              // Display any general runtime output if it exists (e.g., from main function without specific tests)
              if (response.runtimeOutput) {
                  setOutput(prev => (prev || '') + '\n\n--- Runtime Output (if any) ---\n' + response.runtimeOutput);
              }
          } else {
              setOutput('Failed to compile. Check console for network errors.');
          }
      } finally {
          setIsCompiling(false);
      }
  }, [code, selectedLanguage, isCompiling, isRunning, executeCodeOnBackend]);


  // Handle run code request
  const handleRunCode = useCallback(async () => {
    if (isRunning || isCompiling) return; // Prevent multiple runs

    setIsRunning(true);
    setOutput('Running tests...\n');
    setActiveTab('output'); // Start on output tab to show initial running message

    // Reset test case UI states
    setTestCaseResults(prev => prev.map(tc => ({ ...tc, actualOutput: 'Running...', passed: null, error: null })));

    try {
        const response = await executeCodeOnBackend(code, selectedLanguage, question.testCases || []);

        if (response) {
            // Display main console output (compilation and any print statements)
            let combinedOutput = response.compileOutput;
            if (response.runtimeOutput) {
                combinedOutput += (combinedOutput ? '\n\n' : '') + '--- Runtime Output ---\n' + response.runtimeOutput;
            }
            if (!combinedOutput) combinedOutput = 'No output captured.';
            setOutput(combinedOutput);

            // Update individual test case results for UI
            const updatedUITestResults: UITestCaseResult[] = (question.testCases || []).map((qtc, index) => {
                const backendResult = response.results[index]; // Assuming order is maintained
                return {
                    input: qtc.input,
                    expectedOutput: qtc.output,
                    actualOutput: backendResult?.actualOutput || 'N/A',
                    passed: backendResult?.passed || false, // Default to false if not provided by backend for some reason
                    error: backendResult?.error || null,
                };
            });
            setTestCaseResults(updatedUITestResults);

            // Provide toasts based on overall results
            if (response.isCompilationError) {
                toast.error('Compilation failed. Check output tab.');
                setActiveTab('output');
            } else if (response.isRuntimeError) {
                toast.error('Runtime error occurred. Check output and test cases tabs.');
                setActiveTab('test-cases'); // Switch to test cases to highlight errors
            } else {
                const allPassed = updatedUITestResults.every(r => r.passed);
                if (updatedUITestResults.length > 0 && allPassed) {
                    toast.success('All test cases passed! 🎉');
                    setActiveTab('test-cases'); // Stay on test cases if all passed to show green checks
                } else if (updatedUITestResults.length > 0 && !allPassed) {
                    const failedCount = updatedUITestResults.filter(r => !r.passed).length;
                    toast.warning(`${failedCount} test case(s) failed. Check Test Cases tab.`);
                    setActiveTab('test-cases'); // Switch to test cases to highlight failures
                } else {
                    // No test cases or no specific pass/fail determined
                    toast.info('Code executed. Check output tab for console messages.');
                    setActiveTab('output');
                }
            }
        } else {
            setOutput('Code execution failed. Check browser console for more details.');
            toast.error('Code execution failed.');
        }
    } finally {
      setIsRunning(false);
    }
  }, [code, selectedLanguage, isRunning, isCompiling, question.testCases, executeCodeOnBackend, question.id]);

  // Text-to-Speech functionality (using Web Speech API)
  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US'; // Set language
      window.speechSynthesis.speak(utterance);
    } else {
      toast.info('Text-to-speech not supported in this browser.');
    }
  };

  const editorTheme = theme === 'dark' ? 'vs-dark' : 'vs-light';

  const editorOptions: editor.IStandaloneEditorConstructionOptions = {
    minimap: { enabled: true },
    fontSize: 14,
    scrollBeyondLastLine: false,
    automaticLayout: true,
    wordWrap: 'on',
    lineNumbers: 'on',
    roundedSelection: false,
    padding: { top: 10 },
    glyphMargin: false,
    renderLineHighlight: 'gutter',
    scrollbar: {
      verticalScrollbarSize: 8,
      horizontalScrollbarSize: 8,
    },
    // Customize colors for better integration with parent theme
    // These override standard Monaco colors, but can be complex.
    // For simplicity, sticking to 'vs-dark' / 'vs-light' theme base.
  };

  const motionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  return (
    <motion.div
      variants={motionVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      // This component's width is primarily controlled by its parent (TestInterfacePage.tsx)
      // For example, TestInterfacePage might use 'w-full lg:w-11/12' on its container.
      // The height is set to fill available space below header/navbar.
      className={`h-[calc(100vh-140px)] flex flex-col rounded-xl shadow-xl overflow-hidden ${
        theme === 'dark'
          ? 'bg-gradient-to-br from-gray-900/50 to-gray-950/50 border border-gray-700/30'
          : 'bg-white/90 border border-gray-200'
      }`}
    >
      {/* Question Description Section */}
      <div className={`p-6 pb-2 border-b ${
        theme === 'dark' ? 'border-gray-700 bg-gray-800/30' : 'bg-gray-200 '
      }`}>
        <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-semibold">{question.questionText || 'No question text provided.'}</h3>
            <motion.button
                onClick={() => handleSpeak(question.questionText || '')}
                className={`p-1 rounded-full transition-colors ${
                  theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Listen to question"
              >
                <FaVolumeUp className="text-lg" />
            </motion.button>
        </div>
        <div className={`prose max-w-none ${theme === 'dark' ? 'text-gray-300 prose-invert' : 'text-gray-700'}`}>
            <Markdown>{question.documentation || 'No detailed documentation provided.'}</Markdown>
        </div>
      </div>

      {/* Editor and Controls Section */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className={`flex items-center justify-between p-3 border-b ${
          theme === 'dark' ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-100/50'
        }`}>
          <div className="flex items-center gap-4">
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className={`px-3 py-1 rounded-md text-sm ${
                theme === 'dark'
                  ? 'bg-gray-700 text-gray-200 border border-gray-600'
                  : 'bg-gray-200 text-gray-800 border border-gray-300'
              }`}
            >
              {languages.map(lang => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
             {/* Save Button (Simulated) */}
             <button
                className={`p-2 rounded-lg transition-colors ${
                  theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
                }`}
                onClick={() => toast.info('Save functionality not implemented (code auto-saves to user answer).')}
                aria-label="Save code"
             >
               <FaRegSave className="text-lg" />
             </button>
             {/* Copy Button (Functional) */}
             <button
                className={`p-2 rounded-lg transition-colors ${
                  theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
                }`}
                onClick={() => { navigator.clipboard.writeText(code); toast.success('Code copied!'); }}
                aria-label="Copy code"
             >
               <FaRegCopy className="text-lg" />
             </button>
              {/* Flag Button */}
              <motion.button
                  onClick={onToggleFlag}
                  className={`p-2 rounded-lg flex items-center gap-2 transition-colors ${
                      isFlagged
                          ? 'text-yellow-400 hover:bg-yellow-500/20' // Style for flagged
                          : (theme === 'dark'
                              ? 'text-gray-300 hover:bg-gray-700' // Style for not flagged (dark)
                              : 'text-gray-600 hover:bg-gray-100') // Style for not flagged (light)
                  }`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={isFlagged ? 'Unflag question' : 'Flag question'}
              >
                  <FaFlag className="text-lg" />
              </motion.button>
          </div>

          <div className="flex gap-2"> {/* Group compile and run buttons */}
             <motion.button
                onClick={handleCompileCode} // Changed to handleCompileCode
                disabled={isCompiling || isRunning}
                className={`px-4 py-2 rounded-md flex items-center gap-2 font-semibold transition-colors ${
                    isCompiling || isRunning
                      ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                      : (theme === 'dark'
                          ? 'bg-gradient-to-r from-sky-600 to-cyan-700 text-white hover:from-sky-500 hover:to-cyan-600 shadow-md'
                          : 'bg-gradient-to-r from-blue-500 to-teal-600 text-white hover:from-blue-400 hover:to-teal-500 shadow-md')
                }`}
                whileHover={!(isCompiling || isRunning) ? { scale: 1.05 } : undefined}
                whileTap={!(isCompiling || isRunning) ? { scale: 0.95 } : undefined}
                aria-label="Compile code"
              >
                {isCompiling ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Compiling...
                  </>
                ) : (
                  <>
                    <FaTools className="text-sm" />
                    Compile
                  </>
                )}
              </motion.button>

              <motion.button
                onClick={handleRunCode}
                disabled={isRunning || isCompiling} // Disable run button while compiling or running
                className={`px-4 py-2 rounded-md flex items-center gap-2 font-semibold transition-colors ${
                  isRunning || isCompiling
                    ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                    : (theme === 'dark'
                      ? 'bg-gradient-to-r from-sky-600 to-cyan-700 text-white hover:from-sky-500 hover:to-cyan-600 shadow-md'
                      : 'bg-gradient-to-r from-blue-500 to-teal-600 text-white hover:from-blue-400 hover:to-teal-500 shadow-md')
                }`}
                whileHover={!(isRunning || isCompiling) ? { scale: 1.05 } : undefined}
                whileTap={!(isRunning || isCompiling) ? { scale: 0.95 } : undefined}
                aria-label="Run code"
              >
                {isRunning ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <FaPlay className="text-sm" />
                    Run Code
                  </>
                )}
              </motion.button>
          </div>
        </div>

        {/* Editor and Output/Test Cases */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Code Editor */}
          <div className="flex-1 border-r border-b md:border-b-0 md:h-full" style={{ minHeight: '200px' }}> {/* minHeight for smaller screens */}
            <Editor
              height="100%"
              language={selectedLanguage}
              theme={editorTheme}
              value={code}
              onChange={handleEditorChange}
              options={editorOptions}
            />
          </div>

          {/* Output/Test Cases Tabs and Content */}
          <div className="flex-1 flex flex-col" style={{ minHeight: '200px' }}> {/* minHeight for smaller screens */}
            {/* Tabs */}
            <div className={`flex border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
              {['output', 'test-cases'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab
                      ? theme === 'dark'
                        ? 'border-sky-500 text-sky-500'
                        : 'border-blue-500 text-blue-500'
                      : theme === 'dark'
                        ? 'border-transparent text-gray-400 hover:text-gray-200'
                        : 'border-transparent text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {tab.replace('-', ' ').toUpperCase()}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-hidden">
              <AnimatePresence mode="wait">
                {activeTab === 'output' && (
                   <motion.div
                      key="output"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={`p-4 h-full overflow-y-auto text-sm font-mono whitespace-pre-wrap ${
                          theme === 'dark' ? 'bg-gray-800/30 text-gray-300' : 'bg-gray-100 text-gray-700'
                      }`}
                   >
                      {output || 'Run your code to see output here.'}
                   </motion.div>
                )}

                {activeTab === 'test-cases' && (
                  <motion.div
                    key="test-cases"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-6 space-y-4 overflow-y-auto"
                  >
                    {testCaseResults.length === 0 && (question.testCases?.length || 0) === 0 ? (
                         <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                             No test cases provided for this question.
                         </p>
                    ) : testCaseResults.length === 0 && (question.testCases?.length || 0) > 0 ? (
                         <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                             Test cases are available. Run your code to see results.
                         </p>
                    ) : (
                        testCaseResults.map((testCase, index) => (
                          <div
                            key={index}
                            className={`p-4 rounded-lg shadow-sm ${
                              theme === 'dark'
                                ? 'bg-gray-800/50 border border-gray-700'
                                : 'bg-gray-100 border border-gray-200'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="text-sm font-semibold">Test Case {index + 1}</h4>
                                {testCase.passed === true && <FaCheckCircle className="text-green-500 text-lg" />}
                                {testCase.passed === false && <FaTimesCircle className="text-red-500 text-lg" />}
                                {testCase.passed === null && <FaInfoCircle className={`${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} text-lg`} />}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm"> {/* Responsive grid */}
                              <div>
                                <label className={`block text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Input</label>
                                <pre className={`p-2 rounded text-wrap overflow-auto ${
                                  theme === 'dark'
                                    ? 'bg-gray-700 text-gray-200'
                                    : 'bg-gray-200 text-gray-800'
                                }`}>
                                  {testCase.input || 'N/A'}
                                </pre>
                              </div>
                              <div>
                                <label className={`block text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Expected Output</label>
                                <pre className={`p-2 rounded text-wrap overflow-auto ${
                                  theme === 'dark'
                                    ? 'bg-gray-700 text-gray-200'
                                    : 'bg-gray-200 text-gray-800'
                                }`}>
                                  {testCase.expectedOutput || 'N/A'}
                                </pre>
                              </div>
                               {testCase.actualOutput !== null && (
                                   <div>
                                       <label className={`block text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Actual Output</label>
                                       <pre className={`p-2 rounded text-wrap overflow-auto ${
                                           testCase.passed === false ? 'bg-red-200 text-red-800 dark:bg-red-800/50 dark:text-red-200' :
                                           (theme === 'dark' ? 'bg-gray-700 text-gray-200' : 'bg-gray-200 text-gray-800')
                                       }`}>
                                           {testCase.actualOutput || 'N/A'}
                                       </pre>
                                   </div>
                               )}
                               {testCase.error && (
                                   <div className="md:col-span-2"> {/* Span across columns */}
                                       <label className={`block text-xs font-medium mb-1 text-red-600 dark:text-red-400`}>Error</label>
                                       <pre className={`p-2 rounded bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200 text-wrap overflow-auto`}>
                                           {testCase.error}
                                       </pre>
                                   </div>
                               )}
                            </div>
                          </div>
                        ))
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CodingComponent;
