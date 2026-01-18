'use client';

import * as React from 'react';
import { AttendanceLeaveRequestForm } from '@/components/pages/attendance-leave-request-form';

export const DetailLeaveForm = () => {
  return (
    <div className="font-sans min-h-screen flex flex-col py-6">
      <AttendanceLeaveRequestForm isEmployee />;
    </div>
  );
};
