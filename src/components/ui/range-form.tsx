"use client";

import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";

interface RangeFormProps {
  name: string;
  label: string;
  min?: number;
  max?: number;
  required?: boolean;
}

export function RangeForm({ name, label, min = 1, max = 5, required }: RangeFormProps) {
  const { control } = useFormContext();

  const options = Array.from({ length: max - min + 1 }, (_, i) => ({
    value: (min + i).toString(),
    label: (min + i).toString(),
  }));

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="space-y-4">
          <FormLabel className="text-base font-medium text-slate-900">
            {label} {required && <span className="text-destructive">*</span>}
          </FormLabel>
          <FormControl>
            <RadioGroupPrimitive.Root
              className="grid grid-cols-5 gap-3 w-full"
              value={field.value}
              onValueChange={field.onChange}
            >
              {options.map((option) => (
                <RadioGroupPrimitive.Item
                  key={option.value}
                  value={option.value}
                  className={cn(
                    "flex items-center justify-center h-10 border rounded-md transition-all",
                    "border-primary text-primary hover:bg-slate-50",
                    "data-[state=checked]:bg-primary data-[state=checked]:text-white"
                  )}
                >
                  <span className="text-sm font-semibold">{option.label}</span>
                </RadioGroupPrimitive.Item>
              ))}
            </RadioGroupPrimitive.Root>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}