"use client";

import { CheckboxForm } from '@/components/ui/checkbox-form';
import { RangeForm } from '@/components/ui/range-form';
import { TextAreaForm } from '@/components/ui/textarea';
import React from 'react';

interface FormFieldData {
  id: number;
  type: 'checkbox' | 'range' | 'textarea' | 'text' | 'select' | 'radio';
  label: string;
  order: number;
  isRequired: boolean;
  options?: any;
  metadata?: any;
}

export function OffboardingFormBuilder({ fields }: { fields: FormFieldData[] }) {
  return (
    <div className="space-y-10">
      {fields.map((field) => {
        const fieldName = `field_${field.id}`;
        const labelWithOrder = `${field.order}. ${field.label}`;

        switch (field.type) {
          case 'checkbox':
            return (
              <div key={field.id} className="space-y-4 pb-8">
                <p className="text-base font-medium">{labelWithOrder}</p>
                <div className="grid gap-2">
                  {(field.options as string[]).map((option, idx) => (
                    <CheckboxForm
                      key={idx}
                      name={`${fieldName}.${option}`} 
                      label={option}
                      required={field.isRequired}
                    />
                  ))}
                </div>
              </div>
            );

          case 'range':
            return (
              <div key={field.id} className="pb-8">
                <RangeForm
                  name={fieldName}
                  label={labelWithOrder}
                  min={field.options?.min ?? 1}
                  max={field.options?.max ?? 5}
                  required={field.isRequired}
                />
                {field.metadata?.is_note && (
                  <div className="mt-4">
                    <TextAreaForm
                      name={`${fieldName}_notes`}
                      label="Notes"
                      placeholder="Enter notes"
                    />
                  </div>
                )}
              </div>
            );

          case 'textarea':
          case 'text':
            return (
              <div key={field.id} className="pb-8">
                <TextAreaForm
                  name={fieldName}
                  label={labelWithOrder}
                  placeholder="Enter your response"
                  isOptional={!field.isRequired}
                />
              </div>
            );

          default:
            return null;
        }
      })}
    </div>
  );
}