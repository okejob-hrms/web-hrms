'use client';

import * as React from 'react';
import AttendanceTrackerForm from '@/components/pages/attendance-tracket-form';

export default function AttendanceTrackerEdit({
  params,
}: {
  params: Promise<{ id: string; slug: string }>;
}) {
  const { id, slug } = React.use(params);
  return (
    <div className="font-sans min-h-screen">
      <AttendanceTrackerForm id={id} slug={slug} />
    </div>
  );
}
