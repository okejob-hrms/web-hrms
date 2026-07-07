"use client";

import * as React from "react";
import { useFormContext } from "react-hook-form";
import { useTranslations } from "next-intl";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, XCircle } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { BasicDatePickerProps, DatePickerProps } from "@/lib/types";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";

dayjs.extend(localizedFormat);

export const DatePicker: React.FC<
  DatePickerProps & { onChangeExtra?: (date?: Date) => void }
> = ({
  name,
  label,
  description,
  isOptional,
  labelClassName,
  placeholder,
  onChange,
  onChangeExtra,
  ...props
}) => {
  const tCommon = useTranslations("common");
  const { control, formState } = useFormContext();
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const hasValue = !!(props.value || field.value);
        const hasError = !!fieldState.error;

        const handleClear = () => {
          field.onChange(null);
          onChange?.(undefined);
          onChangeExtra?.(undefined);
        };

        return (
          <FormItem className={cn("", props.className)}>
            {label && (
              <FormLabel
                className={cn(
                  "text-sm font-normal",
                  hasError && "text-error",
                  labelClassName,
                )}
              >
                {label}
                {isOptional && (
                  <span className="text-text-disabled"> (optional)</span>
                )}
              </FormLabel>
            )}
            <FormControl>
              <div className="relative">
                <Popover open={isOpen} onOpenChange={setIsOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      type="button"
                      data-empty={!hasValue}
                      className="data-[empty=true]:text-muted-foreground justify-between text-left font-normal border-input h-10 rounded-sm text-foreground w-full pr-16"
                    >
                      {hasValue ? (
                        dayjs(props.value || field.value).format("ll")
                      ) : (
                        <span>{placeholder ?? tCommon("pickDate")}</span>
                      )}
                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={(date) => {
                        field.onChange(date);
                        setIsOpen(false);
                        onChange?.(date);
                        onChangeExtra?.(date);
                      }}
                      captionLayout="dropdown"
                      fromYear={1900}
                      toYear={new Date().getFullYear() + 10}
                    />
                  </PopoverContent>
                </Popover>
                {hasValue && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="absolute right-8 top-1/2 transform -translate-y-1/2 p-1 hover:bg-muted rounded-sm transition-colors"
                  >
                    <XCircle className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                  </button>
                )}
              </div>
            </FormControl>
            {description && <FormDescription>{description}</FormDescription>}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
};

export const BasicDatePicker: React.FC<BasicDatePickerProps> = (props) => {
  const tCommon = useTranslations("common");
  const [isOpen, setIsOpen] = React.useState(false);
  const hasValue = !!props.value;

  const handleClear = () => {
    props.onSelect(undefined);
  };

  return (
    <div>
      <label></label>
      <div className="relative">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              type="button"
              data-empty={!hasValue}
              className="data-[empty=true]:text-muted-foreground justify-between text-left font-normal border-input h-10 rounded-sm text-foreground w-full pr-16"
            >
              {hasValue ? (
                dayjs(props.value).format("ll")
              ) : (
                <span>{props.placeholder ?? tCommon("pickDate")}</span>
              )}
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={props.value}
              onSelect={(date) => {
                props.onSelect(date);
                setIsOpen(false);
              }}
              captionLayout="dropdown"
              fromYear={1900}
              toYear={new Date().getFullYear() + 10}
            />
          </PopoverContent>
        </Popover>
        {hasValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-8 top-1/2 transform -translate-y-1/2 p-1 hover:bg-muted rounded-sm transition-colors"
          >
            <XCircle className="h-4 w-4 text-muted-foreground hover:text-foreground" />
          </button>
        )}
      </div>
    </div>
  );
};
