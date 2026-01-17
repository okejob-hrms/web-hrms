'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm, FormProvider } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { OffboardingFormBuilder } from './form-builder';
import { useESS } from '@/components/pages/ess/hook';
import { IExitFormRequest, ISubmissionForm } from '@/services/form/types';
import { postSubmitExitInterview } from '@/services/form';

interface ExitInterviewFormProps {
  formId?: number;
  offboardingId?: number;
}

export const ExitInterviewForm = ({ formId, offboardingId }: ExitInterviewFormProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { formFields, formFieldsLoading } = useESS({ formId });

  const methods = useForm({
    mode: 'onChange',
  });

  const { reset, handleSubmit, setError } = methods;

  const mutation = useMutation({
    mutationFn: (body: IExitFormRequest) => postSubmitExitInterview(body, offboardingId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offboardingStatus"] });
      toast.success("Exit interview submitted successfully"); //
      router.push('/ess/offboarding');
    },
    onError: async (error: any) => {
      if (error.response?.status === 422) {
        const errorData = await error.response.json();
        const backendErrors = errorData.errors;

        Object.keys(backendErrors).forEach((errorKey) => {
          const match = errorKey.match(/submissions\.(\d+)\.value/);
          if (match) {
            const index = parseInt(match[1]);
            const fieldId = mutation.variables?.submissions[index]?.field_id;
            if (fieldId) {
              setError(`field_${fieldId}`, {
                type: "server",
                message: backendErrors[errorKey][0],
              });
            }
          }
        });
        toast.error("Please check the form for errors");
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }
    }
  });

  // Initialization logic
  const defaultValues = React.useMemo(() => {
    if (!formFields) return {};
    return formFields.reduce((acc, field) => {
      const fieldName = `field_${field.id}`;
      acc[fieldName] = field.type === 'checkbox' ? {} : "";
      return acc;
    }, {} as any);
  }, [formFields]);

  React.useEffect(() => {
    if (formFields) reset(defaultValues);
    if (!formId) router.back();
  }, [formFields, reset, defaultValues, formId, router]);

  const onSubmit = (formData: any) => {
    const submissions: ISubmissionForm[] = Object.keys(formData)
      .filter((key) => key.startsWith("field_") && !key.endsWith("_notes"))
      .map((key) => {
        const fieldId = parseInt(key.replace("field_", ""));
        const rawValue = formData[key];
        let value = rawValue;

        if (typeof rawValue === 'object' && rawValue !== null && !Array.isArray(rawValue)) {
          value = Object.keys(rawValue).filter(k => rawValue[k] === true);
        } 
        if (typeof value === 'string' && value !== "" && !isNaN(Number(value))) {
          value = Number(value);
        }

        const notesKey = `${key}_notes`;
        const additionalData = formData[notesKey] ? { notes: formData[notesKey] } : undefined;

        return { field_id: fieldId, value, additional_data: additionalData };
      });

    mutation.mutate({ submissions });
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Exit Interview Form</h1>
      </div>

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <OffboardingFormBuilder fields={formFields || []} />
          <div className="flex justify-end gap-3 pt-8 border-t">
            <Button 
              type="submit" 
              className="bg-[#336192] hover:bg-[#264a70] text-white px-8"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Submitting..." : "Submit Form"}
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};