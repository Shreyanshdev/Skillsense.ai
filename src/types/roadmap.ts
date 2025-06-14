// src/types/roadmap.ts

export interface UserProfile {
    skills: string[];
    experienceLevel: string;
    careerGoals: string;
    longTermGoals: string;
  }
  
  export interface RoadmapStep {
    step: number;
    title: string;
    description: string;
    estimatedTime?: string;
    resources: string[];
  }
  
  export interface TextRoadmap {
    userProfile: UserProfile;
    durationPreference?: string;
    roadmap: RoadmapStep[];
    summary: string;
  }
  
  // React Flow Node Data
  export interface FlowNodeData {
    title: string;
    description: string;
    link: string;
  }
  
  // Minimal React Flow Node (as returned by AI)
  export interface FlowNode {
    id: string;
    type?: string; // Made optional if you want a default 'turbo'
    position: { x: number; y: number };
    data: FlowNodeData;
  }
  
  // Minimal React Flow Edge (as returned by AI)
  export interface FlowEdge {
    id: string;
    source: string;
    target: string;
  }
  
  export interface FlowRoadmap {
    roadmapTitle: string;
    description: string;
    duration: string;
    initialNodes: FlowNode[];
    initialEdges: FlowEdge[];
  }
  
  export interface AiRoadmapResponse {
    textRoadmap: TextRoadmap;
    flowRoadmap: FlowRoadmap;
  }