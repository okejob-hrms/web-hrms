"use client";

import { Check, ChevronDownIcon, X } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { useState } from "react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ComboboxOption, ComboboxProps, SearchableSelectProps } from "@/lib/types";

function isSelectedValue(
  optionValue: string,
  fieldValue: string | number | null | undefined,
) {
  if (fieldValue === undefined || fieldValue === null || fieldValue === "") {
    return false;
  }
  // Always compare as strings so number form values still match option ids.
  return optionValue === fieldValue.toString();
}

export function SearchableSelect({
  value,
  onValueChange,
  options = [],
  placeholder = "Select",
  disabled,
  className,
  allowClear = true,
  valueType = "string",
  searchValue: externalSearchValue,
  onSearchChange: externalOnSearchChange,
  modalChildren,
  emptyMessage,
  searchPlaceholder,
  popoverClassName,
  isLoading = false,
  loadingMessage,
}: SearchableSelectProps) {
  const tCommon = useTranslations("common");
  const [open, setOpen] = useState(false);
  const [internalSearchTerm, setInternalSearchTerm] = useState("");
  // Fully controlled only when searchValue is provided. If callers pass
  // onSearchChange alone (server-side search), keep local input state so typing
  // still updates the CommandInput while notifying the parent.
  const isSearchControlled = externalSearchValue !== undefined;
  const searchTerm = isSearchControlled
    ? externalSearchValue
    : internalSearchTerm;

  const setSearchTerm = (next: string) => {
    if (!isSearchControlled) {
      setInternalSearchTerm(next);
    }
    externalOnSearchChange?.(next);
  };

  const hasValue = value !== undefined && value !== null && value !== "";

  const selectedOption = hasValue
    ? options.find((item) => isSelectedValue(item.value, value))
    : null;

  const clearSelection = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onValueChange(valueType === "number" ? null : "");
  };

  const handleSelect = (item: ComboboxOption) => {
    const finalValue =
      valueType === "number" ? Number(item.value) : item.value;
    onValueChange(finalValue);
    setOpen(false);
    setSearchTerm("");
  };

  return (
    <Popover
      open={open}
      onOpenChange={(isOpen) => {
        if (disabled) return;
        setOpen(isOpen);
        if (!isOpen) {
          setSearchTerm("");
        }
      }}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between rounded-sm font-normal text-black border-input h-10",
            className,
          )}
        >
          <span className="truncate flex items-center gap-2">
            {selectedOption?.icon}
            {selectedOption?.label || placeholder}
          </span>
          <div className="flex items-center gap-1">
            {allowClear && hasValue && !disabled && (
              <span
                role="button"
                aria-label="Clear selection"
                onClick={clearSelection}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    clearSelection(e as unknown as React.MouseEvent);
                  }
                }}
                className="flex items-center justify-center hover:bg-gray-100 rounded p-1"
                tabIndex={-1}
              >
                <X className="size-3 opacity-50 hover:opacity-100" />
              </span>
            )}
            <ChevronDownIcon className="size-4 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn("w-full p-0", popoverClassName)}>
        <Command filter={externalOnSearchChange ? () => 1 : undefined}>
          <CommandInput
            placeholder={searchPlaceholder ?? `${tCommon("search")}...`}
            className="h-9"
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          <CommandList>
            {isLoading ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                {loadingMessage ?? tCommon("loading")}
              </div>
            ) : (
              <>
                <CommandEmpty>
                  {emptyMessage ?? "No data found."}
                </CommandEmpty>
                <CommandGroup>
                  {allowClear && hasValue && (
                    <CommandItem
                      onSelect={() => {
                        onValueChange(valueType === "number" ? null : "");
                        setOpen(false);
                      }}
                      className="text-muted-foreground"
                    >
                      Clear selection
                    </CommandItem>
                  )}
                  {modalChildren}
                  {options.map((item) => (
                    <CommandItem
                      value={item.label}
                      key={item.value}
                      disabled={item.disabled}
                      onSelect={() => handleSelect(item)}
                    >
                      <span className="flex items-center gap-2">
                        {item.icon}
                        {item.label}
                      </span>
                      <Check
                        className={cn(
                          "ml-auto size-4",
                          isSelectedValue(item.value, value)
                            ? "opacity-100"
                            : "opacity-0",
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export function ComboboxForm({
  label,
  name,
  labelClassName,
  formItemClassName,
  isOptional,
  placeholder,
  options,
  valueType = "string",
  allowClear = true,
  onSearchChange,
  searchValue,
  modalChildren,
  className,
  required,
  disabled,
  emptyMessage,
  searchPlaceholder,
  popoverClassName,
  isLoading,
  loadingMessage,
}: ComboboxProps) {
  const { control } = useFormContext();
  const tCommon = useTranslations("common");

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn("flex flex-col", formItemClassName)}>
          {label && (
            <FormLabel className={cn("text-sm font-normal", labelClassName)}>
              {label}
              {required && <span className="text-error">*</span>}
              {isOptional && (
                <span className="text-text-disabled">
                  {" "}
                  {tCommon("optional")}
                </span>
              )}
            </FormLabel>
          )}
          <FormControl>
            <SearchableSelect
              value={field.value}
              onValueChange={field.onChange}
              options={options}
              placeholder={placeholder ?? tCommon("select")}
              valueType={valueType}
              allowClear={allowClear}
              onSearchChange={onSearchChange}
              searchValue={searchValue}
              modalChildren={modalChildren}
              className={className}
              disabled={disabled}
              emptyMessage={emptyMessage}
              searchPlaceholder={searchPlaceholder}
              popoverClassName={popoverClassName}
              isLoading={isLoading}
              loadingMessage={loadingMessage}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
