"use client";

import { Check, ChevronDownIcon, X } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { useState } from "react";

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
import { ComboboxProps } from "@/lib/types";

export function ComboboxForm({
  label,
  name,
  labelClassName,
  formItemClassName,
  isOptional,
  placeholder = "Select",
  options,
  valueType = "string",
  allowClear = true,
}: ComboboxProps & {
  valueType?: "string" | "number";
  allowClear?: boolean;
}) {
  const { control, setValue } = useFormContext();
  const [open, setOpen] = useState(false);

  const clearSelection = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setValue(name, valueType === "number" ? null : "");
    console.log(`${name} : cleared`);
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const hasValue =
          field.value !== undefined &&
          field.value !== null &&
          field.value !== "";

        const selectedOption = hasValue
          ? options?.find((item) =>
              valueType === "number"
                ? item.value.toString() === field.value.toString()
                : item.value === field.value,
            )
          : null;

        return (
          <FormItem className={cn("flex flex-col", formItemClassName)}>
            <FormLabel className={cn("text-sm font-normal", labelClassName)}>
              {label}{" "}
              {isOptional && (
                <span className="text-text-disabled"> (optional)</span>
              )}
            </FormLabel>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                      "w-full justify-between rounded-sm font-normal text-black border-input h-10",
                    )}
                  >
                    <span className="truncate">
                      {selectedOption?.label || placeholder}
                    </span>
                    <div className="flex items-center gap-1">
                      {allowClear && hasValue && (
                        <button
                          type="button"
                          onClick={clearSelection}
                          className="flex items-center justify-center hover:bg-gray-100 rounded p-1"
                          tabIndex={-1}
                        >
                          <X className="size-3 opacity-50 hover:opacity-100" />
                        </button>
                      )}
                      <ChevronDownIcon className="size-4 opacity-50" />
                    </div>
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search..." className="h-9" />
                  <CommandList>
                    <CommandEmpty>No data found.</CommandEmpty>
                    <CommandGroup>
                      {allowClear && hasValue && (
                        <CommandItem
                          onSelect={() => {
                            setValue(name, valueType === "number" ? null : "");
                            console.log(`${name} : cleared`);
                            setOpen(false);
                          }}
                          className="text-muted-foreground"
                        >
                          Clear selection
                        </CommandItem>
                      )}
                      {options?.map((item) => (
                        <CommandItem
                          value={item.label}
                          key={item.value}
                          onSelect={() => {
                            const finalValue =
                              valueType === "number"
                                ? Number(item.value)
                                : item.value;
                            console.log(`${name} : ${item.label}`);
                            setValue(name, finalValue);
                            setOpen(false);
                          }}
                        >
                          {item.label}
                          <Check
                            className={cn(
                              "ml-auto size-4",
                              (
                                valueType === "number"
                                  ? item.value.toString() ===
                                    field.value?.toString()
                                  : item.value === field.value
                              )
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
