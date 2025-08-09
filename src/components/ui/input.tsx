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
import { cn } from "@/lib/utils";
import { InputFormProps } from "@/lib/types";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ icon, iconPosition = "left", className, ...props }, ref) => {
    return (
      <div className={`relative w-full ${className}`}>
        {icon && iconPosition === "left" && (
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          className={`
            flex h-10 w-full rounded-sm border border-input
            px-3 py-2 text-sm ring-offset-background
            file:border-0 file:bg-transparent file:text-sm file:font-medium
            placeholder:text-text-disabled
            focus-visible:outline-none focus-visible:ring-2 
            focus-visible:ring-ring focus-visible:ring-offset-2
            disabled:cursor-not-allowed disabled:opacity-50
            ${icon && iconPosition === "left" ? "pl-10" : ""}
            ${icon && iconPosition === "right" ? "pr-10" : ""}
          `}
          {...props}
        />

        {icon && iconPosition === "right" && (
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
            {icon}
          </span>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

const InputForm: React.FC<InputFormProps> = ({
  name,
  label,
  placeholder,
  description,
  isOptional,
  labelClassName,
  inputClassName,
  required,
  ...props
}) => {
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
              {required && <span className="text-error">*</span>}
              {isOptional && (
                <span className="text-text-disabled"> (optional)</span>
              )}
            </FormLabel>
          )}
          <FormControl>
            <Input
              {...field}
              placeholder={placeholder}
              className={cn("", inputClassName)}
              type={props.type || "text"}
              disabled={props.disabled}
              value={props.value || field.value}
              autoComplete={props.autoComplete}
              onChange={props.onChange}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export { Input, InputForm };
