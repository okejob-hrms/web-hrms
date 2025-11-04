'use client';

import * as React from 'react';
import SettingsLeaveConfigurationForm from '@/components/pages/settings-leave-form';

export default function LeaveConfigurationEdit({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  return (
    <div className="font-sans min-h-screen">
      <SettingsLeaveConfigurationForm id={id} />
    </div>
  );
}
