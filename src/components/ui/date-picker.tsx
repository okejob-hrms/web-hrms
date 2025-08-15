"use client";

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
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { BasicDatePickerProps, DatePickerProps } from "@/lib/types";

export const DatePicker: React.FC<DatePickerProps> = ({
  name,
  label,
  description,
  isOptional,
  labelClassName,
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
              {isOptional && (
                <span className="text-text-disabled"> (optional)</span>
              )}
            </FormLabel>
          )}
          <FormControl>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  data-empty={!(props.value || field.value)}
                  className="data-[empty=true]:text-muted-foreground justify-start text-left font-normal border-input h-10 rounded-sm"
                >
                  <CalendarIcon />
                  {props.value || field.value ? (
                    format(props.value || field.value, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={(date) => {
                    field.onChange(date);
                  }}
                />
              </PopoverContent>
            </Popover>
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export const BasicDatePicker: React.FC<BasicDatePickerProps> = (props) => {
  return (
    <div>
      <label></label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            data-empty={!props.value}
            className="data-[empty=true]:text-muted-foreground justify-start text-left font-normal border-input h-10 rounded-sm"
          >
            <CalendarIcon />
            {props.value ? (
              format(props.value, "PPP")
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={props.value}
            onSelect={(date) => {
              props.onSelect(date);
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};
