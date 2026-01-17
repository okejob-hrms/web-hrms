'use client';

import { useESS } from '@/components/pages/ess/hook';
import DocumentHandover from '@/components/pages/offboarding/employee-view/sections/document-handover-form';
import { ExitInterviewForm } from '@/components/pages/offboarding/employee-view/sections/exit-interview-form';
import WorkHandover from '@/components/pages/offboarding/employee-view/sections/work-handover-form';
import { MOCK_EXIT_FIELDS } from '@/lib/mock';
import * as React from 'react';

export default function OffboardingStepPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const { offboardingData, offboardingLoading } = useESS();

  const content = React.useMemo(() => {
    switch (id) {
      case 'exit-interview':
        return (
          <ExitInterviewForm 
            formId={offboardingData?.form_id} 
            offboardingId={offboardingData?.id}
          />
        );
      case 'work-handover':
        return <WorkHandover />;
      case 'document-handover':
        return <DocumentHandover />;
      default:
        return <div className="p-10 text-center">Form not found for: {id}</div>;
    }
  }, [id]);

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-4xl mx-auto">
        {content}
      </div>
    </div>
  );
}