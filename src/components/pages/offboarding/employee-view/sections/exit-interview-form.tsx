'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm, FormProvider } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { OffboardingFormBuilder } from './form-builder';

interface ExitInterviewFormProps {
  fields: any[];
  formId: number;
  offboardingId: number;
}

export const ExitInterviewForm = ({ fields, formId, offboardingId }: ExitInterviewFormProps) => {
  const router = useRouter();
  
  const methods = useForm({
    mode: 'onChange',
  });

  const { handleSubmit, formState: { isSubmitting, isValid } } = methods;

  const onSubmit = async (data: any) => {
    try {
      console.log("Submitting Exit Form:", { formId, offboardingId, data });
      router.back();
    } catch (error) {
      console.error("Submission failed", error);
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Exit Interview Form</h1>
        <p className="text-slate-500 text-sm mt-1">Your feedback is valuable to us.</p>
      </div>

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          <OffboardingFormBuilder fields={fields} />

          <div className="flex justify-end gap-3 pt-8">
            
            <Button 
              type="button" 
              variant="outline" 
              disabled={isSubmitting}
            >
              Save as Draft
            </Button>

            <Button 
              type="submit" 
              className="bg-[#336192] hover:bg-[#264a70] text-white px-8"
              disabled={!isValid || isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Form"}
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};