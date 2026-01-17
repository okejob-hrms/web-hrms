'use client';

import * as React from 'react';
import { SelfAssessment } from '@/components/pages/performance-self-assessment-details/employee-details/sections/self-assessment';

export const SectionAssessment = () => {
  return (
    <div className="font-sans min-h-screen flex flex-col py-6">
      <SelfAssessment />;
    </div>
  );
};
