// src/components/ResumeAnalyzer/ResumeChatbot.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { MessageSquare, Send, Bot, User, X } from 'lucide-react'; // Using Lucide for modern icons

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
}

export const ResumeChatbot = () => {
  const theme = useSelector((state: RootState) => state.theme.theme);
  const isDark = theme === 'dark';

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Theme-based colors
  const chatBgClass = isDark ? 'bg-gray-800/80 backdrop-blur-md' : 'bg-white/80 backdrop-blur-md';
  const chatBorderClass = isDark ? 'border-gray-700/50' : 'border-gray-200/50';
  const inputBgClass = isDark ? 'bg-gray-700' : 'bg-gray-100';
  const inputTextColor = isDark ? 'text-gray-100' : 'text-gray-800';
  const placeholderColor = isDark ? 'placeholder-gray-400' : 'placeholder-gray-500';
  const sendButtonClass = 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700';
  const botMessageBg = isDark ? 'bg-blue-800/60' : 'bg-blue-100/60';
  const userMessageBg = isDark ? 'bg-purple-800/60' : 'bg-purple-100/60';
  const botIconBg = isDark ? 'bg-blue-600' : 'bg-blue-500';
  const userIconBg = isDark ? 'bg-purple-600' : 'bg-purple-500';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (inputMessage.trim() === '') return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputMessage.trim(),
    };
    setMessages((prev) => [...prev, newMessage]);
    setInputMessage('');

    // Simulate API call for bot response
    // IMPORTANT: Integrate with your actual backend here.
    // This is just a placeholder.
    setTimeout(() => {
      const botResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: `I received your question: "${newMessage.text}". While I'm just a demo, I'd usually analyze your resume content here!`,
      };
      setMessages((prev) => [...prev, botResponse]);
    }, 1000);
  };

  const chatVariants : Variants = {
    hidden: { opacity: 0, scale: 0.9, y: 50 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
    exit: { opacity: 0, scale: 0.9, y: 50, transition: { duration: 0.2, ease: 'easeIn' } },
  };

  const messageVariants :Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 10 } },
  };

  return (
    <div className="mt-8 relative z-20"> 
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 p-4 rounded-full shadow-lg ${sendButtonClass}
          focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-offset-2 ${isDark ? 'focus:ring-offset-gray-900' : 'focus:ring-offset-white'}
          transition-all duration-300 ease-in-out z-50`} // Increased z-index
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
      >
        <MessageSquare size={28} className="text-white" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={chatVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`fixed bottom-24 right-6 w-full max-w-sm h-96 ${chatBgClass} rounded-2xl shadow-xl flex flex-col border ${chatBorderClass} overflow-hidden`}
          >
            {/* Chat Header */}
            <div className={`p-4 ${sendButtonClass} flex items-center justify-between rounded-t-2xl shadow-sm`}>
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Bot size={20} /> AI Resume Assistant
              </h3>
              <button onClick={() => setIsOpen(false)} className="text-white opacity-80 hover:opacity-100">
                <X size={20} />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
              {messages.length === 0 && (
                <div className="flex items-center justify-center h-full text-center text-gray-500 text-sm">
                  Ask me anything about your resume!
                </div>
              )}
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  variants={messageVariants}
                  initial="hidden"
                  animate="visible"
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start gap-2 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${msg.sender === 'user' ? userIconBg : botIconBg}`}>
                      {msg.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
                    </div>
                    <div className={`max-w-[75%] p-3 rounded-xl ${msg.sender === 'user' ? `${userMessageBg} rounded-br-none` : `${botMessageBg} rounded-bl-none`} text-sm`}>
                      {msg.text}
                    </div>
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendMessage} className={`p-4 border-t ${chatBorderClass} ${inputBgClass}`}>
              <div className="flex rounded-full overflow-hidden shadow-inner">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Type your question..."
                  className={`flex-1 px-4 py-2 ${inputBgClass} ${inputTextColor} ${placeholderColor} focus:outline-none`}
                />
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.9 }}
                  className={`flex items-center justify-center px-4 ${sendButtonClass}`}
                >
                  <Send size={20} />
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};