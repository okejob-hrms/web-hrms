'use client';

import * as React from 'react';
import { DetailLeaveForm } from './detail-leave-form';

type EssOverviewDetailProps = {
  overview?: string;
};

export default function EssOverviewDetail({
  overview,
}: EssOverviewDetailProps) {
  const content = React.useMemo(() => {
    switch (overview) {
      case 'leave-form':
        return <DetailLeaveForm />;
      default:
        return <DetailLeaveForm />;
    }
  }, [overview]);

  return <div className="font-sans min-h-screen flex flex-col">{content}</div>;
}
