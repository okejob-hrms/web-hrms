/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { FieldPath, FieldValues, useFormContext } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ReactNode } from "react";

interface CheckboxFormProps<T extends FieldValues> {
  name: FieldPath<T>;
  label: string | ReactNode;
  description?: string;
  disabled?: boolean;
  required?: boolean;
  children?: (value: any, onChange: (value: any) => void) => ReactNode;
}

export function CheckboxForm<T extends FieldValues>({
  name,
  label,
  description,
  disabled,
  required = false,
  children,
}: CheckboxFormProps<T>) {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const isObjectValue =
          typeof field.value === "object" && field.value !== null;
        const isChecked = isObjectValue ? field.value.checked : field.value;
        const childValue = isObjectValue ? field.value.childValue : undefined;

        const handleCheckboxChange = (checked: boolean) => {
          if (children) {
            field.onChange({
              checked,
              childValue: checked ? childValue || "" : undefined,
            });
          } else {
            field.onChange(checked);
          }
        };

        const handleChildChange = (newChildValue: any) => {
          if (isObjectValue) {
            field.onChange({
              checked: true,
              childValue: newChildValue,
            });
          }
        };

        return (
          <FormItem className="flex flex-col space-y-3 p-1">
            <div className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={isChecked}
                  onCheckedChange={handleCheckboxChange}
                  disabled={disabled}
                  required={required}
                  className={
                    disabled
                      ? "bg-grayscale-10 border border-grayscale-20 data-[state=checked]:border-grayscale-20 data-[state=checked]:bg-grayscale-10 data-[state=checked]:text-grayscale-40"
                      : "bg-transparent"
                  }
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel
                  className={disabled ? "text-text-disabled" : "text-black"}
                >
                  {label}{" "}
                  {required && <span className="text-destructive">*</span>}
                </FormLabel>
                {description && (
                  <FormDescription>{description}</FormDescription>
                )}
              </div>
            </div>

            {children && (
              <div className="pl-8">
                {children(childValue, handleChildChange)}
              </div>
            )}

            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
