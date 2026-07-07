'use client';

import * as React from 'react';
import OvertimeTrackerList from '@/components/pages/overtime-tracker-list';

export const SectionOvertime = () => {
  return (
    <div className="font-sans min-h-screen flex flex-col py-6">
      <OvertimeTrackerList isEmployee />
    </div>
  );
};
