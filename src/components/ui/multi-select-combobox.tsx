/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useFormContext } from "react-hook-form";
import * as React from "react";

import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ComboboxGroup, ComboboxOption } from "@/lib/types";

interface MultiSelectComboboxProps {
  label: string;
  name: string;
  labelClassName?: string;
  formItemClassName?: string;
  isOptional?: boolean;
  placeholder?: string;
  options?: ComboboxOption[];
  groups?: ComboboxGroup[];
  emptyMessage?: string;
  searchPlaceholder?: string;
  popoverClassName?: string;
  renderOption?: (option: ComboboxOption) => React.ReactNode;
}

export function MultiSelectComboboxForm({
  label,
  name,
  labelClassName,
  formItemClassName,
  isOptional,
  placeholder = "Select",
  options = [],
  groups = [],
  emptyMessage = "No data found.",
  renderOption,
}: MultiSelectComboboxProps) {
  const { control, setValue, getValues } = useFormContext();
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");
  const inputRef = React.useRef<HTMLDivElement>(null);

  const getOptionType = (groupLabel: string) => {
    const typeMap: Record<string, string> = {
      Employee: "EmployeeProfile",
      Department: "Departement",
      "Job Level": "JobLevel",
    };
    return typeMap[groupLabel] || "";
  };

  const handleSelect = (option: ComboboxOption, type?: string) => {
    const newValue = {
      value: option.value.toString(),
      type: type || "",
      label: option.label,
    };

    const currentValues = getValues(name) || [];
    const isAlreadySelected = currentValues.some(
      (item: any) =>
        item.value === newValue.value && item.type === newValue.type,
    );

    if (!isAlreadySelected) {
      const updatedValues = [...currentValues, newValue];
      setValue(name, updatedValues);
    }
    setSearchValue("");
    setOpen(false);
  };

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const defaultRender = (option: ComboboxOption) => option.label;

  return (
    <FormField
      control={control}
      name={name}
      render={() => {
        return (
          <FormItem className={cn("flex flex-col", formItemClassName)}>
            <FormLabel className={cn("text-sm font-normal", labelClassName)}>
              {label}{" "}
              {isOptional && (
                <span className="text-text-disabled"> (optional)</span>
              )}
            </FormLabel>

            <div className="relative" ref={inputRef}>
              <Command shouldFilter={false} className="overflow-visible">
                <div className="relative">
                  <CommandInput
                    placeholder={placeholder}
                    value={searchValue}
                    onValueChange={setSearchValue}
                    onFocus={() => setOpen(true)}
                    className="w-full pr-3 py-2 rounded-sm border border-input text-sm h-10"
                    wrapperClassName="px-0 py-0"
                  />
                </div>

                {open && (
                  <CommandList className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-input rounded-sm shadow-lg">
                    <CommandEmpty>{emptyMessage}</CommandEmpty>
                    {options.length > 0 && (
                      <CommandGroup>
                        {options.map((option) => (
                          <CommandItem
                            key={`${option.value}-${option.label}`}
                            onSelect={() => handleSelect(option)}
                            disabled={option.disabled}
                            className={cn(
                              option.disabled &&
                                "opacity-50 cursor-not-allowed",
                            )}
                          >
                            {renderOption
                              ? renderOption(option)
                              : defaultRender(option)}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}
                    {groups.map((group) => (
                      <CommandGroup
                        key={group.label}
                        heading={group.label}
                        className="max-h-[200px] overflow-y-auto"
                      >
                        {group.options.map((option, index) => (
                          <CommandItem
                            key={`${option.value}-${option.label}`}
                            onSelect={() =>
                              handleSelect(option, getOptionType(group.label))
                            }
                            disabled={option.disabled}
                            className={cn(
                              option.disabled &&
                                "opacity-50 cursor-not-allowed",
                            )}
                          >
                            {group.renderOption
                              ? group.renderOption(option, index)
                              : renderOption
                                ? renderOption(option)
                                : defaultRender(option)}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    ))}
                  </CommandList>
                )}
              </Command>
            </div>

            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
