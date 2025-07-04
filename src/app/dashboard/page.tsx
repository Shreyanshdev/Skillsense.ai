// app/(dashboard)/dashboard/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Target,
  Flame,
  Clock,
  Play,
  ChevronRight,
  CheckCircle,
  Award,
  TrendingUp
} from 'lucide-react';
import AppLayout from '@/components/Layout/AppLayout';

const Dashboard = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentStreak, setCurrentStreak] = useState(7);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const currentGoal = {
    title: 'Frontend Developer Mastery',
    progress: 35,
    totalDays: 60,
    currentDay: 21,
    nextTopic: 'React Hooks Advanced Patterns'
  };

  const todaysTasks = [
    { id: 1, title: 'Complete React Hooks Tutorial', completed: true, type: 'learning' },
    { id: 2, title: 'Practice useState & useEffect', completed: true, type: 'practice' },
    { id: 3, title: 'Take Daily Assessment', completed: false, type: 'assessment' },
    { id: 4, title: "Review Yesterday's Code", completed: false, type: 'review' }
  ];

  const weeklyProgress = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((day, i) => ({
    day,
    completed: i < 6
  }));

  const recentAchievements = [
    { title: '7-Day Streak', icon: '🔥', date: 'Today' },
    { title: 'JavaScript Fundamentals', icon: '🏆', date: '2 days ago' },
    { title: 'First Assessment 100%', icon: '⭐', date: '5 days ago' }
  ];

  return (
    <AppLayout>
    <div className="p-6 lg:p-8">
      
      {/* Welcome Header */}
      <div className={`mb-8 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
              Welcome back, <span className="text-sky-400">Alex</span>! 👋
            </h1>
            <p className="text-gray-300">Ready to continue your learning journey?</p>
          </div>
          <div className="hidden lg:flex items-center gap-4">
            <div className="flex items-center gap-2 bg-gradient-to-r from-orange-500/20 to-red-500/20 px-4 py-2 rounded-full border border-orange-400/30">
              <Flame className="w-5 h-5 text-orange-400" />
              <span className="text-orange-400 font-bold">{currentStreak} Day Streak</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Current Goal */}
        <div className={`lg:col-span-2 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-3xl p-6 border border-sky-400/20 transition-all duration-1000 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-sky-400 to-blue-500 rounded-2xl flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{currentGoal.title}</h2>
                <p className="text-gray-400 text-sm">Day {currentGoal.currentDay} of {currentGoal.totalDays}</p>
              </div>
            </div>
            <Link href="/roadmap" className="text-sky-400 hover:text-sky-300 flex items-center gap-1 text-sm">
              View Roadmap <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-300 text-sm">Overall Progress</span>
              <span className="text-sky-400 font-bold">{currentGoal.progress}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div className="bg-gradient-to-r from-sky-400 to-blue-500 h-3 rounded-full transition-all duration-1000 animate-pulse" style={{ width: `${currentGoal.progress}%` }}></div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-sky-500/10 to-blue-600/10 rounded-2xl p-4 border border-sky-400/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sky-400 text-sm font-medium mb-1">Up Next</p>
                <h3 className="text-white font-semibold">{currentGoal.nextTopic}</h3>
              </div>
              <Link href="/learning/21" className="bg-gradient-to-r from-sky-500 to-blue-600 text-white px-4 py-2 rounded-xl hover:from-sky-400 hover:to-blue-500 flex items-center gap-2 hover:scale-105">
                <Play className="w-4 h-4" /> Start Learning
              </Link>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-6">
          <div className={`bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-xl rounded-3xl p-6 border border-orange-400/30 transition-all duration-1000 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-red-500 rounded-2xl flex items-center justify-center">
                <Flame className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl">🔥</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{currentStreak} Days</h3>
            <p className="text-orange-400 text-sm">Current Streak</p>
          </div>

          <div className={`bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-xl rounded-3xl p-6 border border-green-400/30 transition-all duration-1000 delay-400 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl">⏱️</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">2.5h</h3>
            <p className="text-green-400 text-sm">Today's Focus Time</p>
          </div>
        </div>
      </div>

      {/* Additional sections skipped for brevity, can include them next */}
  
    </div>
    </AppLayout>
  );

};

export default Dashboard;
