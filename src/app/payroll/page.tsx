'use client';

import { PayrollList } from '@/components/pages/payroll-list';
import React from 'react';

export default function PayrollTracker() {
  return (
    <div className="font-sans min-h-screen">
      <PayrollList />
    </div>
  );
}
