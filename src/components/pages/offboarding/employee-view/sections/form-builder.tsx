"use client";

import { CheckboxForm } from '@/components/ui/checkbox-form';
import { FormField, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioForm } from '@/components/ui/radio-group';
import { RangeForm } from '@/components/ui/range-form';
import { SelectForm } from '@/components/ui/select-form';
import { TextAreaForm } from '@/components/ui/textarea';
import { IFieldResponse } from '@/services/form/types';
import { useFormContext } from "react-hook-form";
import { useTranslations } from "next-intl";

export function OffboardingFormBuilder({ fields }: { fields: IFieldResponse[] }) {
  const t = useTranslations('offboarding');
  const tCommon = useTranslations('common');
  const { clearErrors } = useFormContext();
  return (
    <div className="space-y-10">
      {fields.map((field) => {
        const fieldName = `field_${field.id}`;
        const labelWithOrder = `${field.order}. ${field.label}`;
        
        const selectOptions = Array.isArray(field.options) 
          ? field.options.map((opt: string) => ({ label: opt, value: opt }))
          : [];

        switch (field.type) {
          case 'checkbox':
            return (
              <FormField
                key={field.id}
                name={fieldName}
                render={() => (
                  <div className="space-y-4 pb-8">
                    <FormLabel className="text-base font-medium text-slate-900">
                      {labelWithOrder} {field.is_required && <span className="text-destructive">*</span>}
                    </FormLabel>
                    <div className="grid gap-2">
                      {(field.options as string[]).map((option, idx) => (
                        <div 
                          key={idx} 
                          onClick={() => clearErrors(fieldName)}
                        >
                          <CheckboxForm
                            name={`${fieldName}.${option}`} 
                            label={option}
                          />
                        </div>
                      ))}
                    </div>
                    <FormMessage className="text-destructive text-sm" />
                  </div>
                )}
              />
            );

          case 'range':
            return (
              <div key={field.id} className="pb-8">
                <RangeForm
                  name={fieldName}
                  label={labelWithOrder}
                  min={field.options?.min ?? 1}
                  max={field.options?.max ?? 5}
                  required={field.is_required}
                />
                {field.metadata?.is_note && (
                  <div className="mt-4">
                    <TextAreaForm
                      name={`${fieldName}_notes`}
                      label={tCommon("notes")}
                      placeholder={t("enterNotes")}
                    />
                  </div>
                )}
              </div>
            );

          case 'textarea':
          case 'text':
            return (
              <FormField
                key={field.id}
                name={fieldName}
                render={() => (
                  <div key={field.id} className="pb-8 space-y-2">
                    <FormLabel className="text-base font-medium text-slate-900">
                      {labelWithOrder} {field.is_required && <span className="text-destructive">*</span>}
                    </FormLabel>
                    <TextAreaForm
                      name={fieldName}
                      placeholder={t("enterResponse")}
                      isOptional={!field.is_required}
                    />
                    {/* Ensure the internal component of TextAreaForm contains <FormMessage /> */}
                  </div>
               )}
              />
            );

            case 'select':
            return (
              <FormField
                key={field.id}
                name={fieldName}
                render={() => (
                  <div key={field.id} className="pb-8 space-y-4">
                    <FormLabel className="text-base font-medium text-slate-900">
                      {labelWithOrder} {field.is_required && <span className="text-destructive">*</span>}
                    </FormLabel>
                    <SelectForm
                      name={fieldName}
                      options={selectOptions}
                      required={field.is_required}
                      placeholder={t("selectOneOption")}
                      className="w-full"
                    />
                  </div>
                    )}
                />
            );

          case 'radio':
            return (
               <FormField
                key={field.id}
                name={fieldName}
                render={() => (
                  <div key={field.id} className="pb-8 space-y-4">
                    <FormLabel className="text-base font-medium text-slate-900">
                      {labelWithOrder} {field.is_required && <span className="text-destructive">*</span>}
                    </FormLabel>
                    <RadioForm
                      name={fieldName}
                      options={selectOptions}
                      isOptional={!field.is_required}
                    />
                    <FormMessage className="text-destructive text-sm" />
                  </div>
                  )}
                />
            );

          default:
            return null;
        }
      })}
    </div>
  );
}