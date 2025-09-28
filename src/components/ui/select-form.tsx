/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn, stringAvatar } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Command as CommandPrimitive, useCommandState } from "cmdk";
import { forwardRef } from "react";
import { OptionFormProps, SelectFilterProps } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Button } from "./button";
import { Check, ChevronDown } from "lucide-react";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./command";

const SelectForm: React.FC<OptionFormProps> = ({
  name,
  label,
  isOptional,
  labelClassName,
  formItemClassName,
  options,
  placeholder,
  className,
  modalChildren,
  type,
}) => {
  const { control } = useFormContext();
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const value =
          field.value !== undefined && field.value !== null
            ? field.value.toString()
            : "";
        return (
          <FormItem className={formItemClassName}>
            {label && (
              <FormLabel className={cn("text-sm font-normal", labelClassName)}>
                {label}
                {isOptional && (
                  <span className="text-text-disabled"> (optional)</span>
                )}
              </FormLabel>
            )}
            <FormControl>
              <Select
                onValueChange={(value) => {
                  if (type === "number") {
                    field.onChange(Number(value));
                  } else {
                    field.onChange(value);
                  }
                }}
                defaultValue={field.value?.toString()}
                value={value}
              >
                <FormControl>
                  <SelectTrigger className={className}>
                    <SelectValue placeholder={placeholder ?? "Select"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {modalChildren && modalChildren}
                  {options.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.icon && item.icon}
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
};

const SelectFilter = React.memo(function SelectField({
  placeholder,
  options,
  label,
}: SelectFilterProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm text-text-secondary">{label}</label>
      <Select>
        <SelectTrigger className="w-[180px] h-10">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
});

const SelectEmployeeForm: React.FC<OptionFormProps> = ({
  name,
  label,
  isOptional,
  labelClassName,
  formItemClassName,
  options,
  placeholder,
  className,
  modalChildren,
  type,
}) => {
  const { control } = useFormContext();
  const [searchValue, setSearchValue] = React.useState("");
  const [open, setOpen] = React.useState(false);

  // Fungsi untuk mendapatkan item yang dipilih berdasarkan value
  const getSelectedItem = (value: string) => {
    return options.find((option) => option.value === value);
  };

  // Filter opsi berdasarkan pencarian
  const filteredOptions = React.useMemo(() => {
    if (!searchValue) return options;

    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(searchValue.toLowerCase()) ||
        (option.subtitle &&
          option.subtitle.toLowerCase().includes(searchValue.toLowerCase())),
    );
  }, [options, searchValue]);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const value =
          field.value !== undefined && field.value !== null
            ? field.value.toString()
            : "";

        const selectedItem = getSelectedItem(value);

        return (
          <FormItem className={formItemClassName}>
            {label && (
              <FormLabel className={cn("text-sm font-normal", labelClassName)}>
                {label}
                {isOptional && (
                  <span className="text-text-disabled"> (optional)</span>
                )}
              </FormLabel>
            )}
            <FormControl>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                      "w-full justify-between h-auto min-h-[40px] p-3",
                      className,
                    )}
                  >
                    {selectedItem ? (
                      <div className="flex items-center gap-2 flex-1">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            className="size-8"
                            src={`${process.env.NEXT_PUBLIC_FILE_URL}/${selectedItem.image}`}
                            alt={selectedItem.label}
                          />
                          <AvatarFallback className="text-base font-medium">
                            {stringAvatar(selectedItem.label)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex text-left items-center gap-2">
                          <span className="text-foreground text-base">
                            {selectedItem.label}
                          </span>
                          <span className="text-text-disabled text-xs">
                            {selectedItem.subtitle ?? "-"}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">
                        {placeholder ?? "Select"}
                      </span>
                    )}
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput
                      placeholder="Search employee..."
                      value={searchValue}
                      onValueChange={setSearchValue}
                      className="h-9"
                    />
                    <CommandEmpty>No employee found.</CommandEmpty>
                    <CommandList>
                      <CommandGroup>
                        {modalChildren && modalChildren}
                        {filteredOptions.map((item: any) => (
                          <CommandItem
                            key={item.value}
                            value={item.value}
                            onSelect={(currentValue) => {
                              const newValue =
                                currentValue === value ? "" : currentValue;
                              if (type === "number") {
                                field.onChange(
                                  newValue ? Number(newValue) : "",
                                );
                              } else {
                                field.onChange(newValue);
                              }
                              setOpen(false);
                              setSearchValue("");
                            }}
                            className="flex items-center gap-3 p-3"
                          >
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                className="size-8"
                                src={`${process.env.NEXT_PUBLIC_FILE_URL}/${item.image}`}
                                alt={item.label}
                              />
                              <AvatarFallback className="text-base font-medium">
                                {stringAvatar(item.label)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col flex-1">
                              <span className="text-foreground text-base">
                                {item.label}
                              </span>
                              <span className="text-text-disabled text-xs">
                                {item.subtitle ?? "-"}
                              </span>
                            </div>
                            <Check
                              className={cn(
                                "ml-auto h-4 w-4",
                                value === item.value
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
            </FormControl>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
};

const CommandEmpty = forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof CommandPrimitive.Empty>
>(({ className, ...props }, forwardedRef) => {
  const render = useCommandState((state) => state.filtered.count === 0);

  if (!render) return null;

  return (
    <div
      ref={forwardedRef}
      className={cn("py-6 text-center text-sm", className)}
      cmdk-empty=""
      role="presentation"
      {...props}
    />
  );
});

CommandEmpty.displayName = "CommandEmpty";

export { SelectForm, SelectFilter, SelectEmployeeForm };
