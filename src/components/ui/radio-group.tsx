'use client';

import * as React from 'react';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { CircleIcon } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { OptionFormProps } from '@/lib/types';

import { cn } from '@/lib/utils';

function RadioGroup({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn('grid gap-3', className)}
      {...props}
    />
  );
}

function RadioGroupItem({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        'border-input text-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 aspect-square size-4 shrink-0 rounded-full border shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="relative flex items-center justify-center"
      >
        <CircleIcon className="fill-primary absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
}

function RadioForm({
  name,
  label,
  isOptional,
  labelClassName,
  options,
  value,
  onChange,
}: OptionFormProps & {
  value?: string;
  onChange?: (val: string) => void;
}) {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {label && (
            <FormLabel className={cn('text-sm font-normal', labelClassName)}>
              {label}
              {isOptional && (
                <span className="text-text-disabled"> (optional)</span>
              )}
            </FormLabel>
          )}
          <FormControl>
            <RadioGroup
              // pakai value dari prop kalau dikasih, fallback ke field.value
              value={value ?? field.value ?? ''}
              onValueChange={(val) => {
                field.onChange(val);
                onChange?.(val); // trigger onChange custom kalau ada
              }}
              className="flex"
            >
              {options.map((item) => (
                <div className="flex items-center gap-3" key={item.value}>
                  <FormControl>
                    <RadioGroupItem value={item.value} id={item.value} />
                  </FormControl>
                  <Label htmlFor={item.value}>{item.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </FormControl>
        </FormItem>
      )}
    />
  );
}

export { RadioGroup, RadioGroupItem, RadioForm };
