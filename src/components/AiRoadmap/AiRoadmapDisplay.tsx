// src/components/RoadmapDisplay/AiRoadmapDisplay.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import axios from 'axios';
import { toast } from 'sonner';
import { BarChart2, BookOpen, Loader2, ExternalLink, Calendar, User, Target, Map as MapIcon } from 'lucide-react';

// React Flow Imports
import ReactFlow, { Controls, Background, MiniMap, useNodesState, useEdgesState, addEdge, BackgroundVariant, Connection, Edge } from 'reactflow';
import 'reactflow/dist/style.css';
import TurboNode from './TurboNode'; // Custom node component
import { AiRoadmapResponse, RoadmapStep, FlowNode, FlowEdge } from '@/types/roadmap'; // Your defined types

const nodeTypes = {
  turbo: TurboNode,
};

export const AiRoadmapDisplay: React.FC = () => {
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
        const response = await axios.get(`/api/history?recordId=${roadmapId}`);
        //@ts-ignore
        const data = response.data.content; // Assuming content directly holds the AiRoadmapResponse
        setRoadmapData(data);

        // Initialize React Flow nodes and edges
        setNodes(data.flowRoadmap.initialNodes.map((node: FlowNode) => ({
          ...node,
          type: node.type || 'turbo', // Ensure type is set, default to 'turbo'
        })));
        setEdges(data.flowRoadmap.initialEdges);
      } catch (err: any) {
        console.error("Failed to fetch roadmap:", err);
        setError(err.response?.data?.error || 'Failed to load roadmap.');
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
    <div className={`min-h-[calc(100vh-80px)] ${containerBgClass} p-4 sm:p-6 lg:p-8 transition-colors duration-300`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`max-w-6xl mx-auto p-6 rounded-2xl shadow-xl ${cardBgClass} backdrop-blur-lg`}
        style={{
          boxShadow: isDark ? '0 8px 32px 0 rgba(31, 38, 135, 0.37)' : '0 8px 32px 0 rgba(0, 0, 0, 0.1)',
        }}
      >
        <h1 className={`text-4xl font-extrabold mb-4 text-center ${textColorClass} drop-shadow-lg`}>
          {flowRoadmap.roadmapTitle || "Your Career Roadmap"}
        </h1>
        <p className={`text-center mb-8 ${subTextColorClass} max-w-2xl mx-auto`}>
          {flowRoadmap.description || "Here's a personalized plan to guide your career journey."}
        </p>

        {/* Tab Navigation */}
        <div className={`flex justify-center mb-8 border-b ${borderColorClass}`}>
          <button
            onClick={() => setActiveTab('text')}
            className={`py-3 px-6 text-lg font-semibold rounded-t-lg transition-all duration-300 flex items-center gap-2
                        ${activeTab === 'text' ? activeTabClass : inactiveTabClass}`}
          >
            <BookOpen size={20} /> Textual View
          </button>
          <button
            onClick={() => setActiveTab('flow')}
            className={`py-3 px-6 text-lg font-semibold rounded-t-lg transition-all duration-300 flex items-center gap-2
                        ${activeTab === 'flow' ? activeTabClass : inactiveTabClass}`}
          >
            <BarChart2 size={20} /> Visual Flow
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
              {/* User Profile */}
              <section className={`mb-8 p-6 rounded-xl ${cardBgClass} border ${borderColorClass}`}>
                <h2 className={`text-2xl font-bold mb-4 ${textColorClass} flex items-center gap-2`}>
                  <User size={24} className="text-purple-400" /> Your Profile
                </h2>
                <p className={`${subTextColorClass} mb-2`}>
                  <strong className={textColorClass}>Skills:</strong> {textRoadmap.userProfile.skills.length > 0 ? textRoadmap.userProfile.skills.join(', ') : 'Not specified'}
                </p>
                <p className={`${subTextColorClass} mb-2`}>
                  <strong className={textColorClass}>Experience Level:</strong> {textRoadmap.userProfile.experienceLevel}
                </p>
                <p className={`${subTextColorClass} mb-2`}>
                  <strong className={textColorClass}>Short-term Goals:</strong> {textRoadmap.userProfile.careerGoals}
                </p>
                <p className={`${subTextColorClass} mb-2`}>
                  <strong className={textColorClass}>Long-term Goals:</strong> {textRoadmap.userProfile.longTermGoals}
                </p>
                {textRoadmap.durationPreference && textRoadmap.durationPreference !== 'no_preference' && (
                    <p className={`${subTextColorClass}`}>
                        <strong className={textColorClass}>Preferred Duration:</strong> {textRoadmap.durationPreference.replace('_', ' ')}
                    </p>
                )}
              </section>

              {/* Roadmap Steps */}
              <section className="mb-8">
                <h2 className={`text-2xl font-bold mb-4 ${textColorClass} flex items-center gap-2`}>
                  <MapIcon size={24} className="text-green-400" /> Roadmap Steps
                </h2>
                <div className="grid gap-6">
                  {textRoadmap.roadmap.map((step: RoadmapStep) => (
                    <motion.div
                      key={step.step}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: step.step * 0.05 }}
                      className={`p-6 rounded-xl ${cardBgClass} border ${borderColorClass} relative overflow-hidden`}
                    >
                        <span className={`absolute -top-3 -left-3 text-7xl font-extrabold opacity-10 ${isDark ? 'text-blue-200' : 'text-blue-600'}`}>{step.step}</span>
                      <h3 className={`text-xl font-semibold mb-2 ${textColorClass} flex items-center gap-2`}>
                        {step.title || `Step ${step.step}`}
                      </h3>
                      {step.estimatedTime && (
                        <p className={`${subTextColorClass} text-sm mb-2 flex items-center gap-1`}>
                          <Calendar size={14} className="inline-block text-orange-400" />
                          <span className="font-medium">Estimated:</span> {step.estimatedTime}
                        </p>
                      )}
                      <p className={`${subTextColorClass} mb-3`}>
                        {step.description}
                      </p>
                      {step.resources && step.resources.length > 0 && (
                        <div>
                          <p className={`font-medium ${textColorClass} mb-1`}>Resources:</p>
                          <ul className="list-disc list-inside space-y-1">
                            {step.resources.map((resource, index) => (
                              <li key={index} className="flex items-center text-sm">
                                <ExternalLink size={14} className={`mr-2 ${subTextColorClass}`} />
                                <a
                                  href={resource}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-400 hover:text-blue-300 transition-colors truncate max-w-full block"
                                >
                                  {resource}
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

              {/* Summary */}
              <section className={`p-6 rounded-xl ${cardBgClass} border ${borderColorClass}`}>
                <h2 className={`text-2xl font-bold mb-4 ${textColorClass} flex items-center gap-2`}>
                  <Target size={24} className="text-red-400" /> Roadmap Summary
                </h2>
                <p className={`${subTextColorClass} leading-relaxed`}>
                  {textRoadmap.summary}
                </p>
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
              className={`react-flow-container h-[600px] rounded-xl overflow-hidden ${cardBgClass} border ${borderColorClass}`}
            >
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                fitView
                className={`${isDark ? 'bg-gray-900/50' : 'bg-gray-50/50'}`}
              >
                <Controls showInteractive={false} className={`${isDark ? 'bg-gray-700 text-gray-200 border-gray-600' : 'bg-white text-gray-700 border-gray-200'}`} />
                <MiniMap nodeStrokeColor={isDark ? '#4A90E2' : '#2196F3'} nodeColor={isDark ? '#3B82F6' : '#2196F3'} nodeBorderRadius={2} maskColor={isDark ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.6)'} className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}`} />
                <Background variant={BackgroundVariant.Dots} gap={12} size={1} color={isDark ? '#4A4A4A' : '#E0E0E0'} />
              </ReactFlow>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};