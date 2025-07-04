"use client";
import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { Flame, Calendar, Target, Award } from "lucide-react";


export default function FeatureCardPage() {
  const theme = useSelector((state: RootState) => state.theme.theme);
  const isDark = theme === "dark";
  const [isLoaded , setIsLoaded] = React.useState(false);
  const userData = {
    currentStreak: 5,
    totalDaysLearned: 30,
    completedGoals: 10,
    achievements: [
      { id: 1, name: "First Step", earned: true },
      { id: 2, name: "Consistency", earned: false },
      { id: 3, name: "Mastery", earned: true },
    ],
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 transition-all duration-1000 delay-200  ${
      true ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
    }`}>
      <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-xl rounded-2xl p-6 border border-orange-400/30">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-red-500 rounded-2xl flex items-center justify-center">
            <Flame className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl">🔥</span>
        </div>
        <h3 className="text-2xl font-bold text-white mb-1">{userData.currentStreak}</h3>
        <p className="text-orange-400 text-sm">Day Streak</p>
      </div>

      <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-xl rounded-2xl p-6 border border-green-400/30">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl">📚</span>
        </div>
        <h3 className="text-2xl font-bold text-white mb-1">{userData.totalDaysLearned}</h3>
        <p className="text-green-400 text-sm">Days Learned</p>
      </div>

      <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-xl rounded-2xl p-6 border border-purple-400/30">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center">
            <Target className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl">🎯</span>
        </div>
        <h3 className="text-2xl font-bold text-white mb-1">{userData.completedGoals}</h3>
        <p className="text-purple-400 text-sm">Goals Completed</p>
      </div>

      <div className="bg-gradient-to-r from-sky-500/20 to-blue-600/20 backdrop-blur-xl rounded-2xl p-6 border border-sky-400/30">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-sky-400 to-blue-500 rounded-2xl flex items-center justify-center">
            <Award className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl">🏆</span>
        </div>
        <h3 className="text-2xl font-bold text-white mb-1">{userData.achievements.filter(a => a.earned).length}</h3>
        <p className="text-sky-400 text-sm">Achievements</p>
      </div>
    </div>

  );
};