'use client'; // This page needs client-side features

import React from 'react';
import AppLayout from '@/components/Layout/AppLayout'; // Import the layout
import EvaluationForm from '@/components/EvaluationForm/EvaluationForm'; // Import the page's content component


export default function EvaluationPage() {

  return (
    <AppLayout>
      <EvaluationForm />
    </AppLayout>
  );
}
