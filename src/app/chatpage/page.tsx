// ChatPage.tsx
'use client';

import EmptyState from '@/components/AIChat/emptyState';
import { Input } from '@/components/AIChat/input';
import AppLayout from '@/components/Layout/AppLayout';
import React, { useState, useEffect, useRef } from 'react';
import { FiSend } from 'react-icons/fi';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import axios from 'axios';
import Markdown from 'react-markdown';

type messages = {
  content: string;
  role: string;
  type: string;
};

// Define TOP_NAVBAR_HEIGHT_PX consistently here as well,
// or better, pass it as a prop from AppLayout if you want more dynamic control.
// For now, let's keep it consistent with AppLayout's assumption.
const TOP_NAVBAR_HEIGHT_PX = 64; // Assuming h-16 for AppLayout's TopNavbar

function ChatPage() {
  const [userInput, setUserInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [messageList, setMessageList] = useState<messages[]>([
    { content: 'Hello! How can I assist you today?', role: 'assistant', type: 'text' },
  ]);
  const theme = useSelector((state: RootState) => state.theme.theme);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollableAreaRef = useRef<HTMLDivElement>(null);

  // Auto-resize textarea and scroll to bottom
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 150) + 'px';
    }

    if (scrollableAreaRef.current) {
      // Use setTimeout to ensure scroll happens after all DOM updates
      setTimeout(() => {
        if (scrollableAreaRef.current) { // Check again in case component unmounted
          scrollableAreaRef.current.scrollTop = scrollableAreaRef.current.scrollHeight;
        }
      }, 0); // Small delay to allow DOM to render
    }
  }, [userInput, messageList, loading]);

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    setLoading(true);
    const newMessageList = [...messageList, { content: userInput, role: 'user', type: 'text' }];
    setMessageList(newMessageList);

    try {
      const result = await axios.post('/api/ai-chat', { userInput });
      setMessageList(prev => [...prev, result.data as messages]);
    } catch (error) {
      console.error("Failed to send message:", error);
      setMessageList(prev => [...prev, {
        content: 'Sorry, I encountered an error. Please try again.',
        role: 'assistant',
        type: 'text'
      }]);
    } finally {
      setUserInput('');
      setLoading(false);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  const textColorClass = theme === 'dark' ? 'text-gray-100' : 'text-gray-900';
  const subTextColorClass = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';
  const borderColorClass = theme === 'dark' ? 'border-gray-700' : 'border-gray-200';
  const bgColorClass = theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50';

  const chatHeaderHeight = '5rem'; // 80px
  const chatInputHeight = '6.5rem'; // 104px

  return (
    <AppLayout>
      {/*
        The parent div of ChatPage should now be a flex container that fills
        the height provided by AppLayout's children div.
        AppLayout's inner div already applies padding-top equal to its navbar height.
      */}
      <div className={`flex flex-col h-full w-full ${bgColorClass}`}>

        {/* Chat Header (No longer fixed, will be pushed down by AppLayout's padding-top) */}
        <div
          className={`flex items-center justify-between py-4 border-b ${borderColorClass} ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}
          style={{ height: chatHeaderHeight }}
        >
          <div className="w-full max-w-4xl mx-auto px-4 sm:px-6">
            <h2 className={`font-bold text-2xl ${textColorClass}`}>AI Career Q&A</h2>
            <p className={`text-md ${subTextColorClass}`}>Smarter career starts here – ask anything!</p>
          </div>
        </div>

        {/* Scrollable Chat Area */}
        <div
          ref={scrollableAreaRef}
          className="overflow-y-auto w-full flex-grow" // flex-grow makes it take available vertical space
        >
          <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6">
            {messageList.length === 1 ? (
              <EmptyState selectedQuestion={(question: string) => setUserInput(question)} />
            ) : (
              <div className="pb-4">
                {messageList.map((message, index) => (
                  <div
                    key={index}
                    className={`mb-4 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] p-4 rounded-2xl ${
                        message.role === 'user'
                          ? 'bg-blue-500 text-white rounded-br-none'
                          : 'bg-gray-200 text-gray-800 rounded-bl-none dark:bg-gray-700 dark:text-gray-200'
                      }`}
                    >
                      <Markdown>
                        {message.content}
                      </Markdown>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start mb-4">
                    <div className="max-w-[85%] p-4 rounded-2xl bg-gray-200 text-gray-800 rounded-bl-none dark:bg-gray-700 dark:text-gray-200">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce mr-2"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce mr-2 delay-100"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Fixed Input Area (remains fixed relative to ChatPage's parent, but will be at the bottom) */}
        <div
          className={`shrink-0 border-t ${borderColorClass} ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}
          style={{ height: chatInputHeight }}
        >
          <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-4">
            <div className={`flex items-end gap-3 w-full rounded-2xl border ${borderColorClass} shadow-sm ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
              <Input
                ref={inputRef}
                placeholder='Type your message here...'
                value={userInput}
                onChange={(event) => setUserInput(event.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                className={`flex-1 border-0 !py-3 resize-none ${
                  theme === 'dark'
                    ? 'bg-transparent text-gray-100 placeholder:text-gray-500 focus-visible:ring-0'
                    : 'bg-transparent text-gray-900 placeholder:text-gray-500 focus-visible:ring-0'
                }`}
                rows={1}
              />
              <button
                onClick={handleSendMessage}
                disabled={!userInput.trim() || loading}
                className={`mb-3 mr-3 mt-2 flex items-center justify-center p-3 rounded-full transition-all duration-300 ease-out cursor-pointer shrink-0 ${
                  !userInput.trim() || loading
                    ? 'text-gray-500 cursor-not-allowed'
                    : theme === 'dark'
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-black text-white hover:bg-gray-800'
                }`}
                aria-label="Send message"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                ) : (
                  <FiSend className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

export default ChatPage;