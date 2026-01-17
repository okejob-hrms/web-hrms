'use client';

import * as React from 'react';
import AttendanceLeaveRequest from '@/components/pages/attendance-leave-request';

export const SectionLeave = () => {
  return (
    <div className="font-sans min-h-screen flex flex-col py-6">
      <AttendanceLeaveRequest isEmployee />;
    </div>
  );
};
