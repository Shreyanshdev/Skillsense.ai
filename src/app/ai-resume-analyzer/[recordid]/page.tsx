"use client";
import { useParams } from 'next/navigation';
import React, {useEffect, useState } from 'react'
import axios from 'axios';
import api from '@/services/api'; 
import AppLayout from '@/components/Layout/AppLayout';
import ResumeAnalyzer from '@/components/AiResume/Report';

interface ResumeAnalyzerRecordData {
  metadeta?: string; // Assuming 'metadeta' (should be 'metadata'?) is a string for the PDF URL
  content?: any;    // 'content' can be whatever structure your AI report has,
}
function AiResumeAnalyzer() {
  const {recordid} = useParams();
  const [pdfUrl, setPdfUrl] = useState<string | undefined>(undefined);
  const [aiReport , setAiReport] = useState<any>(undefined);

  useEffect(() => {
    const GetResumeAnalyzerRecord = async () => {
      if (typeof recordid === 'string') {
        try {
          const result = await api.get<ResumeAnalyzerRecordData>('/history?recordId=' + recordid);
          console.log("Resume Analyzer Record:", result.data);
          setPdfUrl(result.data?.metadeta);
          setAiReport(result.data?.content);
        } catch (error) {
          console.error("Error fetching resume analyzer record:", error);
        }
      }
    };
    if (recordid) {
      GetResumeAnalyzerRecord();
    }
  }, [recordid]);

  return (
  <AppLayout>
    <div >
      <div >
        <ResumeAnalyzer aiReport={aiReport} pdfUrl={pdfUrl}/>
      </div>
    </div>
  </AppLayout>
  )
}

export default AiResumeAnalyzer;