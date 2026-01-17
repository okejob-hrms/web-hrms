'use client';

import * as React from 'react';
import EssOverview from '@/components/pages/ess/sections/overview';

export default function EssDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  return (
    <div className="font-sans min-h-screen">
      <EssOverview overview={id} />
    </div>
  );
}
