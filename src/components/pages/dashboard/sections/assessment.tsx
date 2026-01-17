'use client';

import * as React from 'react';
import { Plus } from 'lucide-react';
import AssessementModal from './modal/assessment-modal';
import { useDashboarAssessment } from '../hooks/assessment';

export const Assessment = () => {
  const hooks = useDashboarAssessment();
  return (
    <div className="font-sans min-h-screen flex flex-col space-y-6 py-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-5">
        <div
          className="h-[380px] bg-primary/10 border border-primary flex flex-col items-center justify-center space-y-2 rounded-xl"
          onClick={() => hooks.setOpen(true)}
        >
          <Plus size={38} className="text-primary" />
          <div className="text-primary font-semibold">
            Add Custom Chart Widget
          </div>
          <div className="text-sm text-gray-600">
            Turn your data into insights by creating a chart widget
          </div>
        </div>
      </div>

      <AssessementModal
        onOpenChange={hooks.setOpen}
        open={hooks.open}
        hook={hooks}
      />
    </div>
  );
};
