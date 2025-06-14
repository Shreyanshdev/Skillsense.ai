// src/app/evaluation/page.tsx
// The main page file for the /evaluation route

'use client'; // This page needs client-side features

import React from 'react';
import AppLayout from '@/components/Layout/AppLayout'; // Import the layout
import EvaluationForm from '@/components/EvaluationForm/EvaluationForm'; // Import the page's content component

// Note: Your Redux Provider should be wrapped around your root layout (e.g., in src/app/layout.tsx)
// for useSelector and useDispatch to work in child components like AppLayout, Sidebar, etc.

export default function EvaluationPage() {
  

  return (
    <AppLayout>
      <EvaluationForm />
    </AppLayout>
  );
}
