// src/app/career-roadmap-generator/[roadmapId]/page.tsx
"use client";
import { AiRoadmapDisplay } from '@/components/AiRoadmap/AiRoadmapDisplay'; // Adjust path
import AppLayout from '@/components/Layout/AppLayout';
import React from 'react';


export default function RoadmapPage() {
  return (
    <main className="min-h-screen">
      <AppLayout>
        <AiRoadmapDisplay />
      </AppLayout>
    </main>
  );
}