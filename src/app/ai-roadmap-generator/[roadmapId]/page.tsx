// src/app/career-roadmap-generator/[roadmapId]/page.tsx
"use client";
import { AiRoadmapDisplay } from '@/components/AiRoadmap/AiRoadmapDisplay'; // Adjust path
import AppLayout from '@/components/Layout/AppLayout';
import App from 'next/app';
import { useParams } from 'next/navigation';


export default function RoadmapPage() {
  const roadmapId = useParams();
  return (
    <main className="min-h-screen">
      <AppLayout>
        <AiRoadmapDisplay />
      </AppLayout>
    </main>
  );
}