"use client";

import * as React from "react";
import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Command as CommandPrimitive, useCommandState } from "cmdk";
import { forwardRef } from "react";
import { OptionFormProps, SelectFilterProps } from "@/lib/types";

const SelectForm: React.FC<OptionFormProps> = ({
  name,
  label,
  isOptional,
  labelClassName,
  formItemClassName,
  options,
  placeholder,
  className,
  modalChildren,
  type,
}) => {
  const { control } = useFormContext();
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const value =
          field.value !== undefined && field.value !== null
            ? field.value.toString()
            : "";
        return (
          <FormItem className={formItemClassName}>
            {label && (
              <FormLabel className={cn("text-sm font-normal", labelClassName)}>
                {label}
                {isOptional && (
                  <span className="text-text-disabled"> (optional)</span>
                )}
              </FormLabel>
            )}
            <FormControl>
              <Select
                onValueChange={(value) => {
                  if (type === "number") {
                    field.onChange(Number(value));
                  } else {
                    field.onChange(value);
                  }
                }}
                defaultValue={field.value?.toString()}
                value={value}
              >
                <FormControl>
                  <SelectTrigger className={className}>
                    <SelectValue placeholder={placeholder ?? "Select"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {modalChildren && modalChildren}
                  {options.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.icon && item.icon}
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
};

const SelectFilter = React.memo(function SelectField({
  placeholder,
  options,
  label,
}: SelectFilterProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm text-text-secondary">{label}</label>
      <Select>
        <SelectTrigger className="w-[180px] h-10">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
});

const CommandEmpty = forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof CommandPrimitive.Empty>
>(({ className, ...props }, forwardedRef) => {
  const render = useCommandState((state) => state.filtered.count === 0);

  if (!render) return null;

  return (
    <div
      ref={forwardedRef}
      className={cn("py-6 text-center text-sm", className)}
      cmdk-empty=""
      role="presentation"
      {...props}
    />
  );
});

CommandEmpty.displayName = "CommandEmpty";

export { SelectForm, SelectFilter };
