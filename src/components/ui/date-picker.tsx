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
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, XCircle } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  BasicDatePickerProps,
  BasicDateRangePickerProps,
  DatePickerProps,
} from "@/lib/types";
import { DateRange } from "react-day-picker";
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
                  <span className="text-text-disabled"> {tCommon("optional")}</span>
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
                      className={cn(
                        "data-[empty=true]:text-muted-foreground justify-between text-left font-normal border-input h-10 rounded-sm text-foreground w-full pr-16",
                        hasError &&
                          "border-destructive focus-visible:ring-destructive",
                      )}
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
                    aria-label={tCommon("clearDate")}
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
  const displayFormat = props.displayFormat ?? "ll";

  const handleClear = () => {
    props.onSelect(undefined);
  };

  return (
    <div className={cn("space-y-2", props.className)}>
      {props.label && (
        <Label className={cn("text-sm font-normal", props.labelClassName)}>
          {props.label}
          {props.isOptional && (
            <span className="text-text-disabled"> {tCommon("optional")}</span>
          )}
        </Label>
      )}
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
                dayjs(props.value).format(displayFormat)
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
              disabled={props.disabled}
            />
          </PopoverContent>
        </Popover>
        {hasValue && (
          <button
            type="button"
            aria-label={tCommon("clearDate")}
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

export const BasicDateRangePicker: React.FC<BasicDateRangePickerProps> = ({
  label,
  isOptional,
  labelClassName,
  className,
  placeholder,
  value,
  onSelect,
  numberOfMonths = 2,
}) => {
  const tCommon = useTranslations("common");
  const [isOpen, setIsOpen] = React.useState(false);
  const [draft, setDraft] = React.useState<DateRange | undefined>(value);

  const updateDraft = (range: DateRange | undefined) => {
    setDraft(range);
  };

  const displaySource = isOpen ? draft : value;
  const hasValue = !!(value?.from || value?.to);
  const hasDisplay = !!(displaySource?.from || displaySource?.to);

  const displayLabel = React.useMemo(() => {
    if (displaySource?.from && displaySource?.to) {
      return `${dayjs(displaySource.from).format("ll")} – ${dayjs(displaySource.to).format("ll")}`;
    }
    if (displaySource?.from) {
      // Partial range while open — show start and an ellipsis for the open end
      return isOpen && !displaySource.to
        ? `${dayjs(displaySource.from).format("ll")} – …`
        : dayjs(displaySource.from).format("ll");
    }
    return null;
  }, [displaySource?.from, displaySource?.to, isOpen]);

  const commitRange = (range?: DateRange) => {
    if (!range?.from) {
      onSelect(undefined);
      return;
    }
    // Single-day: treat incomplete end as same as start
    onSelect({ from: range.from, to: range.to ?? range.from });
  };

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    updateDraft(undefined);
    onSelect(undefined);
  };

  const handleSelect = (range: DateRange | undefined) => {
    updateDraft(range);
    if (!range?.from) {
      onSelect(undefined);
      return;
    }
    if (range.to) {
      commitRange(range);
      setIsOpen(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (open) {
      updateDraft(value);
      setIsOpen(true);
      return;
    }
    // Incomplete draft on dismiss → discard and keep the last committed value
    updateDraft(value);
    setIsOpen(false);
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label className={cn("text-sm font-normal", labelClassName)}>
          {label}
          {isOptional && (
            <span className="text-text-disabled"> {tCommon("optional")}</span>
          )}
        </Label>
      )}
      <div className="relative">
        <Popover open={isOpen} onOpenChange={handleOpenChange}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              type="button"
              data-empty={!hasDisplay}
              className="data-[empty=true]:text-muted-foreground justify-between text-left font-normal border-input h-10 rounded-sm text-foreground w-full min-w-60 pr-16"
            >
              {displayLabel ? (
                <span className="truncate">{displayLabel}</span>
              ) : (
                <span>{placeholder ?? tCommon("pickDateRange")}</span>
              )}
              <CalendarIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={draft}
              onSelect={handleSelect}
              numberOfMonths={numberOfMonths}
              captionLayout="dropdown"
              fromYear={1900}
              toYear={new Date().getFullYear() + 10}
              defaultMonth={draft?.from ?? value?.from}
            />
          </PopoverContent>
        </Popover>
        {hasValue && (
          <button
            type="button"
            aria-label={tCommon("clearDateRange")}
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

