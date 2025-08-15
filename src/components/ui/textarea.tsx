import * as React from "react";
import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { TextareaFormProps } from "@/lib/types";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className,
      )}
      {...props}
    />
  );
}

function TextAreaForm({
  name,
  label,
  placeholder,
  description,
  isOptional,
  labelClassName,
  inputClassName,
  ...props
}: TextareaFormProps) {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn("", props.className)}>
          {label && (
            <FormLabel className={cn("text-sm font-normal", labelClassName)}>
              {label}
              {isOptional && (
                <span className="text-text-disabled"> (optional)</span>
              )}
            </FormLabel>
          )}
          <FormControl>
            <Textarea
              {...field}
              placeholder={placeholder}
              className={cn("min-h-32", inputClassName)}
              disabled={props.disabled}
              autoComplete={props.autoComplete}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export { Textarea, TextAreaForm };
