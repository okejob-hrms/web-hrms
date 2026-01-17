'use client';

import React from 'react';
import { Button } from '@/components/ui/button'; // Adjust path
import { Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useESS } from '../../ess/hook';

type OffboardingStatus = 'completed' | 'active' | 'pending';

interface Task {
  id: string;
  title: string;
  description: string;
  status: OffboardingStatus;
}

const tasks: Task[] = [
  {
    id: 'exit-interview',
    title: "Exit Interview Form",
    description: "Please complete your exit interview to help us understand your experience.",
    status: 'active',
  },
  {
    id: 'work-handover',
    title: "Work & Responsibilities Handover",
    description: "Transfer your current responsibilities to ensure a smooth transition.",
    status: 'active',
  },
  {
    id: 'document-handover',
    title: "Document Handover",
    description: "Make sure all necessary files are shared before your last day.",
    status: 'active',
  },
  {
    id: 'equipment',
    title: "Equipment & Facility Return",
    description: "HR will handle the return list for your assigned equipment and facilities. Please make sure all items are ready for collection.",
    status: 'pending'
  },
];

export const OffboardingEmployeeCard = () => {

  const { 
    offboardingProgress, 
    offboardingProgressLoading, 
    offboardingData 
  } = useESS();

  if (offboardingProgressLoading) {
    return (
      <div className="flex justify-center p-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const getSlugByType = (type: string) => {
    const map: Record<string, string> = {
      'exit_interview_form': 'exit-interview',
      'work_handover': 'work-handover',
      'document_handover': 'document-handover',
      'equipment_facility_return': 'equipment'
    };
    return map[type] || type;
  };


  const router = useRouter();
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-8 md:p-12 shadow-sm max-w-4xl mx-auto">
      <div className="mb-10">
        <h2 className="text-xl font-bold text-slate-900">Complete Your Offboarding Tasks</h2>
        <p className="text-slate-500 text-sm mt-1">Complete your offboarding tasks to ensure a smooth exit</p>
      </div>

      <div className="relative">
        <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-slate-100" />

        <div className="space-y-10">
          {offboardingProgress?.map((task, index) => {
            const isCompleted = task.is_completed;
            const slug = getSlugByType(task.type);
            
            const isActive = !isCompleted && offboardingData?.status === 1;

            return (
              <div key={task.id} className="relative flex items-start">
                <div className={cn(
                  "relative z-10 flex items-center justify-center w-6 h-6 rounded-full border-2 bg-white mt-1 transition-all",
                  isCompleted ? "bg-slate-700 border-slate-700" : (isActive ? "border-primary" : "border-slate-300")
                )}>
                  {isCompleted && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                  {isActive && <div className="w-2 h-2 rounded-full bg-primary" />}
                </div>

                <div className="ml-6 flex-1 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="max-w-md">
                    <h3 className={cn(
                      "font-bold text-base",
                      isCompleted ? "text-slate-500" : "text-[#2B5783]"
                    )}>
                      {task.label}
                    </h3>
                    <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                      {task.description}
                    </p>
                  </div>

                  {task.type !== 'equipment_facility_return' && !isCompleted && (
                    <Button 
                      variant="default" 
                      className="min-w-[120px] bg-[#336192] hover:bg-[#264a70] text-white font-semibold"
                      onClick={() => router.push(`/ess/offboarding/${slug}`)}
                    >
                      Start
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};