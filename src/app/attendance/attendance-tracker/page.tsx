'use client';

import React from 'react';
import { AttendanceTrackerList } from '@/components/pages/attendance-tracker-list';

export default function AttendanceTracker() {
  return (
    <div className="font-sans min-h-screen">
      <AttendanceTrackerList />
    </div>
  );
}
