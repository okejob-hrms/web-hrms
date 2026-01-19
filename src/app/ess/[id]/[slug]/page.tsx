'use client';

import * as React from 'react';
import EssOverviewDetail from '@/components/pages/ess/sections/overview/detail';

export default function EssDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = React.use(params);
  return (
    <div className="font-sans min-h-screen">
      <EssOverviewDetail overview={slug} />
    </div>
  );
}
