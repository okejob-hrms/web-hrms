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
import { BasicDatePickerProps, DatePickerProps } from "@/lib/types";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";

dayjs.extend(localizedFormat);

export const DatePicker: React.FC<DatePickerProps> = ({
  name,
  label,
  description,
  isOptional,
  labelClassName,
  // required,
  placeholder,
  ...props
}) => {
  const { control } = useFormContext();
  const [isOpen, setIsOpen] = React.useState(false);

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
            <Popover open={isOpen} onOpenChange={setIsOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  type="button"
                  data-empty={!(props.value || field.value)}
                  className="data-[empty=true]:text-muted-foreground justify-between text-left font-normal border-input h-10 rounded-sm text-foreground"
                >
                  {props.value || field.value ? (
                    dayjs(props.value || field.value).format("ll")
                  ) : (
                    <span>{placeholder ?? "Pick a date"}</span>
                  )}
                  <CalendarIcon color="#D9D9D9" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={(date) => {
                    field.onChange(date);
                    setIsOpen(false);
                  }}
                  captionLayout="dropdown"
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
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div>
      <label></label>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            type="button"
            data-empty={!props.value}
            className="data-[empty=true]:text-muted-foreground justify-start text-left font-normal border-input h-10 rounded-sm text-foreground"
          >
            {props.value ? (
              dayjs(props.value).format("ll")
            ) : (
              <span>{props.placeholder ?? "Pick a date"}</span>
            )}
            <CalendarIcon color="#D9D9D9" />
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
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};
