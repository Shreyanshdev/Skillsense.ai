// src/hooks/useSpeechRecognition.ts
import { useState, useEffect } from 'react';

export const useSpeechRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined' || !('webkitSpeechRecognition' in window)) return;

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const current = event.resultIndex;
      const transcript = event.results[current][0].transcript;
      setTranscript(transcript);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    return () => recognition.abort();
  }, []);

  const startListening = () => {
    setTranscript('');
    setIsListening(true);
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.start();
    }
  };

  const stopListening = () => {
    setIsListening(false);
  };

  return { isListening, transcript, startListening, stopListening };
};