'use client';

import * as React from 'react';
import PayrollForm from '@/components/pages/payroll-form';

export default function PayrollTrackerForm({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  return (
    <div className="font-sans min-h-screen">
      <PayrollForm id={id} />
    </div>
  );
}
