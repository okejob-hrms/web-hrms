/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Search } from "lucide-react";
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
import { ComboboxOption } from "@/lib/types";

interface MultiSelectComboboxProps {
  label: string;
  name: string;
  labelClassName?: string;
  formItemClassName?: string;
  isOptional?: boolean;
  placeholder?: string;
  options?: ComboboxOption[];
  groups?: { label: string; options: ComboboxOption[] }[];
  emptyMessage?: string;
  searchPlaceholder?: string;
  popoverClassName?: string;
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
  searchPlaceholder = "Search...",
}: MultiSelectComboboxProps) {
  const { control, setValue, getValues } = useFormContext();
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  // const allOptions = [...options, ...groups.flatMap((group) =>
  //   group.options.map(option => ({
  //     ...option,
  //     type: group.label === "Employee" ? "EmployeeProfile" :
  //           group.label === "Department" ? "Departement" : "JobLevel"
  //   }))
  // )];

  const handleSelect = (option: ComboboxOption & { type?: string }) => {
    const newValue = {
      value: option.value.toString(),
      type: option.type || "",
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
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input
                type="text"
                placeholder={placeholder}
                value={searchValue}
                onChange={(e) => {
                  setSearchValue(e.target.value);
                  setOpen(true);
                }}
                onFocus={() => setOpen(true)}
                className="w-full pl-10 pr-3 py-2 rounded-sm border border-input text-sm h-10"
              />

              {open && (
                <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-input rounded-sm shadow-lg">
                  <Command>
                    <CommandList className="overflow-auto">
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
                              {option.label}
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
                          {group.options.map((option) => (
                            <CommandItem
                              key={`${option.value}-${option.label}`}
                              onSelect={() =>
                                handleSelect({
                                  ...option,
                                  type:
                                    group.label === "Employee"
                                      ? "EmployeeProfile"
                                      : group.label === "Department"
                                        ? "Departement"
                                        : "JobLevel",
                                })
                              }
                              disabled={option.disabled}
                              className={cn(
                                option.disabled &&
                                  "opacity-50 cursor-not-allowed",
                              )}
                            >
                              {option.label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      ))}
                    </CommandList>
                  </Command>
                </div>
              )}
            </div>

            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
