// src/components/RoadmapDisplay/AiRoadmapDisplay.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import axios from 'axios';
import api from '@/services/api'; 
import { toast } from 'react-hot-toast';
import { BarChart2, BookOpen, Loader2, ExternalLink, Calendar, User, Target, Map as MapIcon } from 'lucide-react';

// React Flow Imports
import ReactFlow, { Controls, Background, MiniMap, useNodesState, useEdgesState, addEdge, BackgroundVariant, Connection, Edge } from 'reactflow';
import 'reactflow/dist/style.css';
import TurboNode from './TurboNode'; // Custom node component
import { AiRoadmapResponse, RoadmapStep, FlowNode, FlowEdge } from '@/types/roadmap'; // Your defined types

const nodeTypes = {
  turbo: TurboNode,
};

export default function AiRoadmapDisplay() {
  const { roadmapId } = useParams<{ roadmapId: string }>(); // Get ID from URL
  const theme = useSelector((state: RootState) => state.theme.theme);
  const isDark = theme === 'dark';

  const [roadmapData, setRoadmapData] = useState<AiRoadmapResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'text' | 'flow'>('text');

  // React Flow states
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const onConnect = useCallback((params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  // Theme-dependent classes
  const containerBgClass = isDark ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-gray-50 to-white';
  const cardBgClass = isDark ? 'bg-gray-800/70 border-gray-700/50' : 'bg-white/70 border-gray-200/50';
  const textColorClass = isDark ? 'text-gray-100' : 'text-gray-900';
  const subTextColorClass = isDark ? 'text-gray-400' : 'text-gray-600';
  const borderColorClass = isDark ? 'border-gray-700' : 'border-gray-300';
  const activeTabClass = isDark ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white';
  const inactiveTabClass = isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300';

  useEffect(() => {
    if (!roadmapId) {
      setError('Roadmap ID not found.');
      setLoading(false);
      return;
    }

    const fetchRoadmap = async () => {
      try {
        const response = await api.get(`/history?recordId=${roadmapId}`);

        const data = response.data.content; // Assuming content directly holds the AiRoadmapResponse
        setRoadmapData(data);

        // Initialize React Flow nodes and edges
        setNodes(data.flowRoadmap.initialNodes.map((node: FlowNode) => ({
          ...node,
          type: node.type || 'turbo', // Ensure type is set, default to 'turbo'
        })));
        setEdges(data.flowRoadmap.initialEdges);
      } catch (error) {
        console.error("Failed to fetch roadmap:", error);
        toast.error('Failed to load roadmap. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchRoadmap();
  }, [roadmapId, setNodes, setEdges]); // Add setNodes and setEdges to dependencies

  if (loading) {
    return (
      <div className={`flex flex-col items-center justify-center min-h-[calc(100vh-80px)] ${containerBgClass} p-6`}>
        <Loader2 className={`animate-spin ${textColorClass}`} size={48} />
        <p className={`mt-4 text-xl ${subTextColorClass}`}>Loading your personalized roadmap...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center min-h-[calc(100vh-80px)] ${containerBgClass} p-6`}>
        <p className={`text-red-500 text-xl`}>Error: {error}</p>
        <p className={`${subTextColorClass} mt-2`}>Please ensure the roadmap ID is valid or try generating a new one.</p>
      </div>
    );
  }

  if (!roadmapData) {
    return (
      <div className={`flex flex-col items-center justify-center min-h-[calc(100vh-80px)] ${containerBgClass} p-6`}>
        <p className={`${subTextColorClass} text-xl`}>No roadmap data found.</p>
        <p className={`${subTextColorClass} mt-2`}>It might still be generating or an error occurred.</p>
      </div>
    );
  }

  const { textRoadmap, flowRoadmap } = roadmapData;

  return (
  <div className={`min-h-screen ${containerBgClass} p-4 sm:p-6 lg:p-8 transition-colors duration-300`}>
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`max-w-6xl mx-auto p-6 rounded-3xl shadow-2xl ${cardBgClass} backdrop-blur-xl`}
    >
      <h1 className={`text-3xl md:text-4xl font-bold mb-3 text-center ${textColorClass}`}>
        {flowRoadmap.roadmapTitle || 'Career Roadmap'}
      </h1>
      <p className={`text-sm md:text-base text-center mb-6 ${subTextColorClass}`}>{flowRoadmap.description || 'Your personalized learning journey.'}</p>

      <div className={`flex justify-center mb-6 border-b ${borderColorClass}`}>
        <button
          onClick={() => setActiveTab('text')}
          className={`py-2 px-5 text-sm md:text-base font-medium rounded-t-lg transition-all duration-300 flex items-center gap-2 ${activeTab === 'text' ? activeTabClass : inactiveTabClass}`}
        >
          <BookOpen size={18} /> Text View
        </button>
        <button
          onClick={() => setActiveTab('flow')}
          className={`py-2 px-5 text-sm md:text-base font-medium rounded-t-lg transition-all duration-300 flex items-center gap-2 ${activeTab === 'flow' ? activeTabClass : inactiveTabClass}`}
        >
          <BarChart2 size={18} /> Visual Flow
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'text' && (
          <motion.div
            key="text-roadmap"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="text-roadmap-content"
          >
            <section className={`mb-6 p-5 rounded-xl ${cardBgClass} border ${borderColorClass}`}>
              <h2 className={`text-xl font-semibold mb-3 ${textColorClass} flex items-center gap-2`}>
                <User size={20} className="text-orange-500" /> Profile
              </h2>
              <p className={`${subTextColorClass} text-sm mb-1`}><strong className={textColorClass}>Skills:</strong> {textRoadmap.userProfile.skills.join(', ') || 'None'}</p>
              <p className={`${subTextColorClass} text-sm mb-1`}><strong className={textColorClass}>Experience:</strong> {textRoadmap.userProfile.experienceLevel}</p>
              <p className={`${subTextColorClass} text-sm mb-1`}><strong className={textColorClass}>Short Goals:</strong> {textRoadmap.userProfile.careerGoals}</p>
              <p className={`${subTextColorClass} text-sm mb-1`}><strong className={textColorClass}>Long Goals:</strong> {textRoadmap.userProfile.longTermGoals}</p>
              {textRoadmap.durationPreference && (
                <p className={`${subTextColorClass} text-sm`}><strong className={textColorClass}>Duration:</strong> {textRoadmap.durationPreference.replace('_', ' ')}</p>
              )}
            </section>

            <section className="mb-6">
              <h2 className={`text-xl font-semibold mb-3 ${textColorClass} flex items-center gap-2`}>
                <MapIcon size={20} className="text-green-500" /> Steps
              </h2>
              <div className="grid gap-5">
                {textRoadmap.roadmap.map((step: RoadmapStep) => (
                  <motion.div
                    key={step.step}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: step.step * 0.05 }}
                    className={`p-5 rounded-xl ${cardBgClass} border ${borderColorClass} relative overflow-hidden`}
                  >
                    <span className={`absolute -top-3 -left-3 text-6xl font-bold opacity-10 ${isDark ? 'text-red-300' : 'text-red-500'}`}>{step.step}</span>
                    <h3 className={`text-lg font-medium mb-1 ${textColorClass}`}>{step.title}</h3>
                    {step.estimatedTime && <p className={`${subTextColorClass} text-xs mb-2`}><Calendar size={14} className="inline mr-1 text-orange-400" />Estimated: {step.estimatedTime}</p>}
                    <p className={`${subTextColorClass} text-sm mb-2`}>{step.description}</p>
                    {step.resources?.length > 0 && (
                      <div>
                        <p className={`text-sm font-medium ${textColorClass} mb-1`}>Resources:</p>
                        <ul className="list-disc ml-5 space-y-1 text-xs">
                          {step.resources.map((r, i) => (
                            <li key={i} className="flex items-center gap-1">
                              <ExternalLink size={12} className={`${subTextColorClass}`} />
                              <a href={r} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline truncate">
                                {r}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </section>

            <section className={`p-5 rounded-xl ${cardBgClass} border ${borderColorClass}`}>
              <h2 className={`text-xl font-semibold mb-3 ${textColorClass} flex items-center gap-2`}>
                <Target size={20} className="text-red-500" /> Summary
              </h2>
              <p className={`${subTextColorClass} text-sm leading-relaxed`}>{textRoadmap.summary}</p>
            </section>
          </motion.div>
        )}

        {activeTab === 'flow' && (
          <motion.div
            key="flow-roadmap"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className={`react-flow-container h-[500px] rounded-xl overflow-hidden ${cardBgClass} border ${borderColorClass}`}
          >
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              nodeTypes={nodeTypes}
              fitView
              className={`${isDark ? 'bg-gray-900/60' : 'bg-gray-100/60'}`}
            >
              <Controls className={`${isDark ? 'bg-gray-700 text-gray-100 border-gray-600' : 'bg-white text-gray-700 border-gray-200'}`} />
              <MiniMap
                nodeStrokeColor={isDark ? '#EF4444' : '#F97316'}
                nodeColor={isDark ? '#7F1D1D' : '#F87171'}
                maskColor={isDark ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.6)'}
                nodeBorderRadius={2}
                className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}`}
              />
              <Background variant={BackgroundVariant.Dots} gap={12} size={1} color={isDark ? '#4B5563' : '#D1D5DB'} />
            </ReactFlow>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  </div>
);


};