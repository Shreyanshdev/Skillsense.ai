"use client";
import { useParams } from 'next/navigation';
import React, { use, useEffect, useState } from 'react'
import axios from 'axios';
import AppLayout from '@/components/Layout/AppLayout';
import ResumeAnalyzer from '@/components/AiResume/Report';

function AiResumeAnalyzer() {
  const {recordid} = useParams();
  const [pdfUrl , setPdfUrl] = useState();
  const [aiReport , setAiReport] = useState();

  useEffect(() => {
     recordid && GetResumeAnalyzerRecord();
  }, [recordid]);

  
  const GetResumeAnalyzerRecord = async () => {
      const result = await axios.get('/api/history?recordId=' + recordid);
      console.log("Resume Analyzer Record:", result.data);
      //@ts-ignore
      setPdfUrl(result.data?.metadeta);
      //@ts-ignore
      setAiReport(result.data?.content);
  }
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