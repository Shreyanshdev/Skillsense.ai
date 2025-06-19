// src/components/AIChat/ChatPage.tsx
"use client";

import EmptyState from '@/components/AIChat/emptyState';
import { Input } from '@/components/AIChat/input';
import AppLayout from '@/components/Layout/AppLayout';
import React, { useState, useEffect, useRef, useLayoutEffect, useCallback } from 'react';
import { FiSend } from 'react-icons/fi';
import { BsStars } from "react-icons/bs";
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';1
import { v4 as uuidv4 } from 'uuid';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Volume2,  History as HistoryIcon, X, PlusCircle, ChevronsDown, VolumeX } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import 'react-json-pretty/themes/monikai.css';
import { ChatMessage } from '@/components/AIChat/MarkdownComponents';
import api from '@/services/api';


// --- Type Definitions ---
interface Message {
  content: string;
  role: string;
  type: string;
}
interface MessagePart {
  content: string;
  role: 'user' | 'assistant';
  type: 'text';
}
interface HistoryRecord {
  recordId: string;
  content: MessagePart[];
  userEmail: string;
  createdAt: string;
  title?: string;
  id?: number;
  aiAgentType?: string;
}

function ChatPage() {
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [userInput, setUserInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [messageList, setMessageList] = useState<Message[]>([]);
  const { chatid } = useParams();
  const router = useRouter();
  const theme = useSelector((state: RootState) => state.theme.theme);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollableChatContainerRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const currentAudioInstanceRef = useRef<HTMLAudioElement | null>(null);

  const [scrolledToBottom, setScrolledToBottom] = useState(true);
  const [showSidebar, setShowSidebar] = useState(false);
  const [chatHistoryList, setChatHistoryList] = useState<HistoryRecord[]>([]);

  // --- Auto-resize textarea ---
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 150) + 'px';
    }
  }, [userInput]);

  // --- Auto-scroll to bottom on message updates and initial load ---
  useLayoutEffect(() => {
    const scrollToBottom = () => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    };

    scrollToBottom();

    const scrollContainer = scrollableChatContainerRef.current;
    if (scrollContainer) {
      const handleScroll = () => {
        const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
        setScrolledToBottom(scrollHeight - scrollTop <= clientHeight + 50);
      };
      scrollContainer.addEventListener('scroll', handleScroll);
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, [messageList, loading]);

  //Send UserInput to Ai
  const handleSendMessage = async () => {
    if (!userInput.trim()) return;
  
    setLoading(true);
  
    const userMessage: Message = { content: userInput, role: 'user', type: 'text' };
    console.log([...messageList]);
    const updatedMessageList = [...messageList, userMessage];
    setMessageList(updatedMessageList);
    setUserInput('');
  
    try {
      // Include last few exchanges (user + assistant), NOT just user
      const trimmedHistory = updatedMessageList.slice(-8); // ideally even 10-12, depending on cost
      
  
      // In your handleSendMessage()
        const result = await axios.post<Message>("/api/ai-chat", {
          messages: [
            ...messageList,               // your state: array of {role, content, type} here we can also send trimmedHistory else we can also trim this at backend
            { role: "user", content: userInput, type: "text" }
          ]
        });
        console.log(result.data);
      setMessageList(prev => [...prev, result.data]);

    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error('Failed to send message. Please try again.');
      setMessageList(prev => [...prev, {
        content: 'Sorry, I encountered an error. Please try again.',
        role: 'assistant',
        type: 'text'
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };
  

  const GetMessageList = useCallback(async () => {
    setLoading(true);
    try {
      const result = await api.get('/history?recordId=' + chatid);
      // Explicitly cast result.data to HistoryRecord to access its properties
      const historyData = result.data as HistoryRecord; // <-- Type assertion here
      if ('content' in historyData && Array.isArray(historyData.content) && historyData.content.length > 0) {
        setMessageList(historyData.content as MessagePart[]);
      } else {
        setMessageList([{ content: 'Hello! How can I assist you today?', role: 'assistant', type: 'text' }]);
      }
    } catch (error) {
      console.error("Error fetching message list from history:", error);
      toast.error('Failed to load chat history.');
      setMessageList([{ content: 'Sorry, I failed to load previous chat history. Please start a new conversation.', role: 'assistant', type: 'text' }]);
    } finally {
      setLoading(false);
    }
  }, [chatid]);

  const updateMessageList = useCallback(async () => {
    try {
      await axios.put('/api/history',{
        content: messageList,
        recordId: chatid,
        aiAgentType: '/ai-chat'
      })
    } catch (error) {
      console.error("Error updating history:", error);
      toast.error('Failed to save chat progress.');
    }
  }, [messageList, chatid]);

  const fetchChatHistoryList = useCallback(async () => {
    try {
        const response = await api.get<HistoryRecord[]>('/history');
        //1. Filter history records where aiAgentType is '/ai-chat' and sort it like today history will be on top
        const filteredHistory = response.data.filter(record => record.aiAgentType === '/ai-chat')
                                              .sort((a, b) =>
                                                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                                              );

        // 2. Build titles based on recency
        const now = new Date();
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);

        const formattedHistory = filteredHistory.map(record => {
          const d = new Date(record.createdAt);
          const timeOpts: Intl.DateTimeFormatOptions = {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          };
          let dateLabel: string;
          if (d.toDateString() === now.toDateString()) {
            dateLabel = `Today ${d.toLocaleTimeString([], timeOpts)}`;
          } else if (d.toDateString() === yesterday.toDateString()) {
            dateLabel = `Yesterday ${d.toLocaleTimeString([], timeOpts)}`;
          } else {
            const dateOpts: Intl.DateTimeFormatOptions = {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            };
            dateLabel = `${d.toLocaleDateString([], dateOpts)} ${d.toLocaleTimeString([], timeOpts)}`;
          }
          return {
            ...record,
            // use existing title if provided, otherwise our new dateLabel
            title: record.title || dateLabel
          };
        });

        setChatHistoryList(formattedHistory);

    } catch (error) {
        console.error("Error fetching chat history list:", error);
        toast.error('Failed to load chat history list.');
    }
  }, []);

  useEffect(() => {
    if (chatid) {
      GetMessageList();
    } else {
      setMessageList([{ content: 'Hello! How can I assist you today?', role: 'assistant', type: 'text' }]);
    }
    fetchChatHistoryList();
  }, [chatid, GetMessageList, fetchChatHistoryList]);

  useEffect(() => {
    if (chatid && messageList.length > 0 && !(messageList.length === 1 && messageList[0].role === 'assistant' && messageList[0].content === 'Hello! How can I assist you today?')) {
      updateMessageList();
    }
  }, [messageList, chatid, updateMessageList]);

  //New chat logic -> generate new uuid -> save it in history and setmesssage on every call in databse
  const onNewChat = async () => {
    const newRecordId = uuidv4();
    try {
      await axios.post('/api/history', {
        recordId: newRecordId,
        content: [],
        aiAgentType: '/ai-chat',
      });
      router.push("/ai-chat" + "/" + newRecordId);
      fetchChatHistoryList();
    } catch (error) {
      console.error("Error saving history or navigating:", error);
      toast.error('Failed to start a new chat.');
    }
  };

  //speech to text for userInput (It is webbased simple for now)
  const startRecording = async () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('Speech Recognition is not supported in this browser. Please use Chrome/Edge for best results.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Initialize Web Speech API
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true; // Keep listening
      recognition.interimResults = true; // Show results as they are being recognized
      recognition.lang = 'en-US'; // Or dynamically set based on user's locale

      recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        // we can update a separate state for interim results to show live typing feedback
        if (finalTranscript) {
          setUserInput(prevInput => prevInput + finalTranscript + ' '); // Append new final results
        }
      };
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        toast.error(`Speech recognition error: ${event.error}. Please ensure microphone access is granted.`);
        setIsRecording(false);
      };
      recognition.onend = () => {
        console.log('Speech recognition service disconnected.');
        setIsRecording(false);
      };
      recognitionRef.current = recognition; // Store recognition object in ref
      recognition.start();
      setIsRecording(true);
      toast('Recording started... Speak now!');
    } catch (err) {
      console.error('Error accessing microphone for Web Speech API:', err);
      toast.error('Error accessing microphone. Please allow access for speech recognition.');
    }
  };
  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
      toast('Recording stopped.');
    }
  };

  // Function to handle speaking or stopping designed for speaking Ai output
  const toggleSpeech = (text: string) => {
    if (!text || text.trim() === '') {
      toast.error('No text to speak.');
      return;
    }
    if (!('speechSynthesis' in window)) {
      toast.error('Text-to-speech not supported in this browser.');
      return;
    }
    // Check if the *current* utterance being spoken is the one we want to stop
    // Or if any speech is active and we just want to cancel
    if (isSpeaking && currentUtteranceRef.current?.text === text) {
      console.log('Stopping speech...');
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      currentUtteranceRef.current = null;
    } else {
      // Cancel any *other* ongoing speech before starting new
      window.speechSynthesis.cancel();
      console.log('Starting speech...');
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.onstart = () => {
        console.log('Speech started for:', text);
        setIsSpeaking(true);
      };
      utterance.onend = () => {
        console.log('Speech ended for:', text);
        setIsSpeaking(false);
        currentUtteranceRef.current = null;
      };
      utterance.onerror = (event) => {
        console.error('Speech error:', event.error, 'for text:', text);
        // Only show a toast if the error is NOT 'interrupted'
        if (event.error !== 'interrupted') {
            toast.error(`Text-to-speech error: ${event.error}.`);
        } else {
            // Optionally log or handle 'interrupted' specifically if needed
            console.log('Speech was intentionally interrupted.');
        }
        setIsSpeaking(false);
        currentUtteranceRef.current = null;
    };
      window.speechSynthesis.speak(utterance);
      currentUtteranceRef.current = utterance; // Store the current utterance
    }
  };
  useEffect(() => {
    return () => {
      if (window.speechSynthesis && isSpeaking) {
        window.speechSynthesis.cancel();
        console.log('Speech cancelled on component unmount.');
      }
    };
  }, [isSpeaking]);


  //styles for chat interface
  const isDark = theme === 'dark';
  const chatAreaBgClass = isDark
  ? "bg-gray-900/40 backdrop-blur-lg"
  : "bg-white/40 backdrop-blur-lg";

  const userBubbleBg = 'bg-gradient-to-br from-sky-500 to-blue-600';
  const userBubbleText = 'text-white';
  const assistantBubbleBg = isDark ? 'bg-gray-800' : 'bg-gray-100';
  const assistantBubbleText = isDark ? 'text-gray-200' : 'text-gray-900';
  const assistantBubbleShadow = isDark ? 'shadow-md' : 'shadow-md';

  const inputBorderClass = isDark ? 'border-gray-700' : 'border-gray-300';
  const inputBgClass = 'bg-transparent';
  const inputTextColor = isDark ? 'text-gray-100' : 'text-gray-900';
  const inputPlaceholderColor = isDark ? 'placeholder-gray-400' : 'placeholder-gray-500';
  const inputShadowClass = 'shadow-lg shadow-blue-500/20 dark:shadow-sky-500/10';
  const inputFocusEffect = `focus-within:ring-2 focus-within:ring-blue-500/50 dark:focus-within:ring-sky-500/50 focus-within:shadow-xl focus-within:shadow-blue-500/30 dark:focus-within:shadow-sky-500/20`;

  const primaryBtnBg = 'bg-gradient-to-br from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700';
  const primaryBtnText = 'text-white';
  const ease = [0.25, 0.1, 0.25, 1];

  const headerTextGradient = isDark ? 'bg-gradient-to-r from-sky-400 to-blue-600' : 'bg-gradient-to-r from-blue-600 to-sky-700';

  const showEmptyState = messageList.length === 1 && messageList[0].role === 'assistant' && messageList[0].content === 'Hello! How can I assist you today?' && !loading;


  return (
    <AppLayout>
      <div className={`flex h-full w-full ${chatAreaBgClass} transition-colors duration-300 font-sans relative -mb-9`}>
        {/* New Chat Button - Fixed Top-Left */}
        <motion.button
          whileHover={{ scale: 1.05, boxShadow: isDark ? '0 8px 25px rgba(0,255,255,0.3)' : '0 8px 25px rgba(0,0,255,0.2)' }}
          whileTap={{ scale: 0.95 }}
          onClick={onNewChat}
          className={`fixed top-4 left-4 z-50 inline-flex items-center space-x-2 px-5 py-2 rounded-full font-semibold text-base
                     transition-all duration-300 ease-in-out ${primaryBtnBg} ${primaryBtnText} cursor-pointer
                     shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-400 focus:ring-offset-2
                     ${isDark ? 'focus:ring-offset-gray-900' : 'focus:ring-offset-white'} cursor-pointer
                     transform hover:-translate-y-0.5
                     lg:px-6 lg:py-3 lg:text-lg`}
        >
          <BsStars className="h-5 w-5 lg:h-6 lg:w-6" />
          <span className="hidden sm:inline">New Chat</span>
        </motion.button>

        {/* Main Content Area (Chat + Input) */}
        <div className={`flex flex-col flex-grow relative overflow-hidden ${showSidebar ? 'lg:mr-[250px] transition-all duration-300' : ''}`}> {/* Added lg: to mr-[250px] */}
             {/* Main Chat Messages Area */}
            <div ref={scrollableChatContainerRef} className="flex-grow overflow-y-auto w-full px-4 sm:px-6 lg:px-8 pb-4 custom-scrollbar relative">
                <div className="w-full max-w-4xl mx-auto py-4">

                    {/* Chat Header (Always Present, Scrollable) */}
                    <div className="py-8 px-4 sm:px-6 lg:px-8 text-center bg-transparent">
                    <h1 className={`text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text ${headerTextGradient} leading-tight`}>
                        AI Career Q&A
                    </h1>
                    <p className={`text-lg sm:text-xl ${isDark ? 'text-gray-300' : 'text-gray-700'} mt-3`}>
                        Smarter career starts here – ask anything!
                    </p>
                    </div>

                    {/* Empty State or Chat Messages */}
                    {showEmptyState ? (
                        <EmptyState selectedQuestion={(question: string) => setUserInput(question)} />
                    ) : (
                        <motion.div layout className="space-y-6 pt-4">
                        <AnimatePresence initial={false}>
                            {messageList.map((message, index) => (
                            <motion.div
                                key={`msg-${index}-${message.role}`}
                                variants={{
                                  hidden: { opacity: 0, y: 20 },
                                  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
                                  exit: { opacity: 0, y: -20, transition: { duration: 0.2, ease: "easeIn" } }
                                }}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} items-start group`}
                            >
                                <div
                                className={`max-w-[100%] p-4 rounded-xl shadow-md ${
                                    message.role === 'user'
                                    ? `${userBubbleBg} ${userBubbleText}` 
                                    : 'bg-transparent'
                                }`}
                                style={{
                                    borderRadius: message.role === 'user'
                                    ? '1.25rem 1.25rem 0.35rem 1.25rem'
                                    : '1.25rem 1.25rem 1.25rem 0.35rem'
                                }}
                                >
                                <ChatMessage content={message.content} isDark={isDark} />
                                </div>
                                {/* Speaker Button BESIDE AI responses */}
                                {message.role === 'assistant' && message.type === 'text' && (
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => toggleSpeech(message.content)}
                                        className={`ml-2 p-2 rounded-full transition-all duration-200
                                        ${isDark ? `bg-gray-700/70 hover:bg-gray-600/70 hover:${inputShadowClass} hover:${inputFocusEffect} text-gray-300` 
                                                : `bg-gray-200/70 hover:bg-gray-300/70 text-gray-700 hover:${inputShadowClass} hover:${inputFocusEffect}`}
                                        flex-shrink-0 self-baseline-last cursor-pointer`}
                                        aria-label="Listen to response"
                                    >{isSpeaking && currentUtteranceRef.current?.text === message.content ? (
                                      <VolumeX size={20} />
                                    ) : (
                                      <Volume2 size={20} />
                                    )}
                                        
                                    </motion.button>
                                )}
                            </motion.div>
                            ))}
                        </AnimatePresence>
                        {loading && (
                            <motion.div
                            key="loading-indicator"
                            variants={{
                              hidden: { opacity: 0, y: 20 },
                              visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
                              exit: { opacity: 0, y: -20, transition: { duration: 0.2, ease: "easeIn" } }
                            }}
                            initial="hidden"
                            animate="visible"
                            className="flex justify-start"
                            >
                            <div className={`p-4 rounded-xl ${assistantBubbleBg} ${assistantBubbleText} ${assistantBubbleShadow}`}
                                style={{ borderRadius: '1.25rem 1.25rem 1.25rem 0.35rem' }}>
                                <div className="flex items-center">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse mr-2"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse mr-2 delay-100"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-200"></div>
                                </div>
                            </div>
                            </motion.div>
                        )}
                        <div ref={messagesEndRef} className="pt-2" />
                        </motion.div>
                    )}
                </div>
                {/* Scroll to bottom button */}
                {!scrolledToBottom && !showEmptyState && (
                    <motion.button
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    onClick={() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })}
                    className={`fixed bottom-[100px] right-6 sm:right-8 p-3 rounded-full shadow-lg z-40 cursor-pointer
                                ${primaryBtnBg} ${primaryBtnText} `}
                    aria-label="Scroll to bottom"
                    >
                    <ChevronsDown size={24} />
                    </motion.button>
                )}
            </div>


            {/* Input Area - Replicated Gemini's input bar with enhancements */}
              <div className={`sticky bottom-0 left-0 right-0 w-full z-20 py-4 px-4 sm:px-6 lg:px-8 `}>
                <div className="w-full max-w-4xl mx-auto">
                  <div className={`relative flex items-end w-full min-h-[64px] rounded-3xl border ${inputBorderClass} ${inputShadowClass} ${inputBgClass} ${inputFocusEffect} overflow-hidden transition-all duration-300 ease-in-out`}>
                        {/* Plus Button for more options */}
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setShowMoreOptions(!showMoreOptions)}
                          className={`flex items-center justify-center p-3 rounded-full absolute left-2 bottom-2 z-10 cursor-pointer
                                    ${isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-200'}`}
                          aria-label="More options"
                        >
                          {showMoreOptions ? <X size={24} /> : <PlusCircle size={24} />}
                        </motion.button>

                        {/* Input Field */}
                        <Input
                          ref={inputRef}
                          placeholder='Message AI Career Q&A...'
                          value={userInput}
                          onChange={(event) => setUserInput(event.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                          className={`flex-1 !py-4 pl-14 pr-24 text-lg rounded-3xl resize-none ${inputTextColor} ${inputPlaceholderColor} bg-transparent focus:ring-0 `}
                          rows={1}
                        />

                        {/* Microphone Button */}
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={isRecording ? stopRecording : startRecording}
                          className={`absolute right-14 bottom-3 flex items-center justify-center p-3 mr-1.5 rounded-full transition-all duration-300 ease-out shrink-0 cursor-pointer
                            ${isRecording ? 'bg-red-500 text-white animate-pulse' : `${isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-200'}`} `}
                          aria-label={isRecording ? "Stop recording" : "Start recording voice input"}
                          title={isRecording ? "Stop Recording" : "Voice Input (Coming Soon)"}
                        >
                          <Mic className="w-5 h-5" />
                        </motion.button>

                        {/* Send Button */}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleSendMessage}
                          disabled={!userInput.trim() || loading || isRecording}
                          className={`absolute right-3 bottom-3 flex items-center justify-center p-3 rounded-full transition-all duration-300 ease-out shrink-0 cursor-pointer
                            ${!userInput.trim() || loading || isRecording
                              ? `${isDark ? 'bg-gray-700' : 'bg-gray-200'}`
                              : `${primaryBtnBg} ${primaryBtnText} shadow-md`
                            }`}
                          aria-label="Send message"
                        >
                          {loading ? (
                            <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                          ) : (
                            <FiSend className="w-5 h-5" />
                          )}
                        </motion.button>
                      </div>
                      {/* More Options Popover */}
                      <AnimatePresence>
                          {showMoreOptions && (
                              <motion.div
                                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                  animate={{ opacity: 1, y: 0, scale: 1 }}
                                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                  transition={{ duration: 0.2 }}
                                  className={`absolute bottom-[100px] left-0.1 -translate-x-1/2 p-4 rounded-xl shadow-2xl z-30 
                                              ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}
                                              text-center ${isDark ? 'text-gray-200' : 'text-gray-800'}`}
                              >
                                  <p className="font-semibold text-lg mb-2">🚀 Features Available Soon!</p>
                                  <ul className="list-disc list-inside text-sm space-y-1 text-left">
                                      <li>Image Upload (for resume analysis)</li>
                                      <li>Document Analysis (PDF, DOCX)</li>
                                      <li>Personalized Interview Practice</li>
                                      <li>Career Path Planning</li>
                                  </ul>
                              </motion.div>
                          )}
                      </AnimatePresence>
                      <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'} mt-2 text-center`}>
                        AI Career Q&A may display inaccurate info, including about people, so double-check its responses.
                      </p>
                    </div>
                  </div>
        </div>

        {/* Right Sidebar for Chat History */}
        <AnimatePresence>
      {showSidebar && (
        <>
          {/* sidebar */}
          <motion.div
            key="sidebar"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.4, ease :[0.25, 0.1, 0.25, 1]  }}
            className={`
              fixed right-0 top-0 h-full w-64 z-40 flex flex-col
              backdrop-blur-lg
              ${isDark 
                ? "bg-gray-900/90 border-l border-gray-700" 
                : "bg-white/90 border-l border-gray-200"}
              custom-scrollbar
            `}
          >
            {/* sticky header */}
            <div className={`
              sticky top-0 z-50 flex items-center justify-between px-4 py-3
              ${isDark 
                ? "bg-gray-900/95 border-b border-gray-700" 
                : "bg-white/95 border-b border-gray-200"}
            `}>
              <h3 className={`text-lg font-bold ${isDark ? "text-gray-100" : "text-gray-900"}`}>
                Chat History
              </h3>
              <motion.button
                whileHover={{ rotate: 90 }}
                whileTap={{ scale: 0.8 }}
                onClick={() => setShowSidebar(false)}
                className={`
                  p-2 rounded-full transition-colors
                  ${isDark 
                    ? "text-gray-400 hover:bg-gray-700" 
                    : "text-gray-600 hover:bg-gray-200"}
                `}
              >
                <X size={20} />
              </motion.button>
            </div>

            {/* list */}
            <ul className="flex-grow overflow-y-auto p-4 space-y-2">
              {chatHistoryList.length === 0 ? (
                <p className={`${isDark ? "text-gray-400" : "text-gray-500"} text-sm`}>
                  No recent chats.
                </p>
              ) : (
                chatHistoryList.map(record => {
                  const isActive = record.recordId === chatid
                  return (
                    <li key={record.recordId}>
                      <motion.button
                        whileHover={{ x: 8 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => {
                          router.push(`/ai-chat/${record.recordId}`)
                          setShowSidebar(false)
                        }}
                        className={`
                          block w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200
                          ${isDark 
                            ? "text-gray-300 hover:bg-gray-800" 
                            : "text-gray-700 hover:bg-gray-100"}
                          ${isActive ? `${primaryBtnBg} ${primaryBtnText} font-semibold` : ""}
                        `}
                      >
                        {record.title}
                      </motion.button>
                    </li>
                  )
                })
              )}
            </ul>
          </motion.div>
        </>
      )}
    </AnimatePresence>

        {/* Toggle Sidebar Button (Fixed Top-Right) */}
        <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowSidebar(!showSidebar)}
            className={`fixed top-4 right-4 z-50 p-3 rounded-full shadow-lg transition-all duration-300 cursor-pointer
                       ${isDark ? 'bg-gray-800 text-gray-200 hover:bg-gray-700' : 'bg-white text-gray-800 hover:bg-gray-100'}
                       lg:hidden`}
            aria-label="Toggle chat history"
        >
            <HistoryIcon size={24} />
        </motion.button>
        {/* Always visible sidebar icon on large screens */}
        <div className={`hidden lg:block fixed top-4 right-4 z-50 `}>
             <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowSidebar(!showSidebar)}
                className={`p-3 rounded-full shadow-lg transition-all duration-300 cursor-pointer
                           ${isDark ? 'bg-gray-800 text-gray-200 hover:bg-gray-700' : 'bg-white text-gray-800 hover:bg-gray-100'}`}
                aria-label="Toggle chat history"
            >
                <HistoryIcon size={24} />
            </motion.button>
        </div>

      </div>
    </AppLayout>
  );
}

export default ChatPage;