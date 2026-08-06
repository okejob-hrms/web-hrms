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
import { useTranslations } from "next-intl";
import { ComboboxForm, SearchableSelect } from "./combobox";

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
  required,
  disabled,
  searchValue,
  onSearchChange,
  allowClear,
}) => {
  const tCommon = useTranslations("common");

  return (
    <ComboboxForm
      name={name}
      label={label}
      isOptional={isOptional}
      labelClassName={labelClassName}
      formItemClassName={formItemClassName}
      options={options}
      placeholder={placeholder ?? tCommon("select")}
      className={className}
      modalChildren={modalChildren}
      valueType={type}
      required={required}
      disabled={disabled}
      searchValue={searchValue}
      onSearchChange={onSearchChange}
      allowClear={allowClear}
    />
  );
};

const SelectFilter = React.memo(function SelectField({
  placeholder,
  options,
  label,
  value,
  onValueChange,
}: SelectFilterProps) {
  const tCommon = useTranslations("common");
  const [internalValue, setInternalValue] = React.useState<string>("");

  const currentValue = value ?? internalValue;
  const handleChange = (newValue: string | number | null) => {
    const stringValue = newValue?.toString() ?? "";
    setInternalValue(stringValue);
    onValueChange?.(stringValue);
  };

  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm text-text-secondary">{label}</label>}
      <SearchableSelect
        value={currentValue}
        onValueChange={handleChange}
        options={options}
        placeholder={placeholder ?? tCommon("select")}
        className="w-[180px] h-10"
        allowClear={false}
      />
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
  searchValue: externalSearchValue,
  onSearchChange: externalOnSearchChange,
  required,
}) => {
  const { control } = useFormContext();
  const tCommon = useTranslations("common");
  const [internalSearchValue, setInternalSearchValue] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [cachedSelectedItem, setCachedSelectedItem] = React.useState<any>(null);
  const searchValue = externalSearchValue ?? internalSearchValue;
  const setSearchValue = externalOnSearchChange ?? setInternalSearchValue;

  const filteredOptions = React.useMemo(() => {
    if (externalOnSearchChange) return options;
    if (!searchValue) return options;
    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(searchValue.toLowerCase()) ||
        (option.subtitle &&
          option.subtitle.toLowerCase().includes(searchValue.toLowerCase())),
    );
  }, [options, searchValue, externalOnSearchChange]);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const value =
          field.value !== undefined && field.value !== null
            ? field.value.toString()
            : "";

        const selectedItem =
          options.find((option) => option.value.toString() === value) ||
          (cachedSelectedItem?.value.toString() === value
            ? cachedSelectedItem
            : undefined);

        return (
          <FormItem className={formItemClassName}>
            {label && (
              <FormLabel className={cn("text-sm font-normal", labelClassName)}>
                {label}
                {required && <span className="text-error">*</span>}
                {isOptional && (
                  <span className="text-text-disabled"> {tCommon("optional")}</span>
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
                          <span className="text-text-disabled text-xs font-normal">
                            {selectedItem.subtitle ?? "-"}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">
                        {placeholder ?? tCommon("select")}
                      </span>
                    )}
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>

                <PopoverContent className="w-full p-0" align="start">
                  <Command filter={() => 1}>
                    <CommandInput
                      placeholder={tCommon("searchEmployee")}
                      value={searchValue}
                      onValueChange={setSearchValue}
                      className="h-9"
                    />
                    <CommandEmpty>{tCommon("noEmployeeFound")}</CommandEmpty>
                    <CommandList key={searchValue}>
                      <CommandGroup>
                        {modalChildren && modalChildren}
                        {filteredOptions.map((item) => (
                          <CommandItem
                            key={item.value}
                            value={item.value.toString()}
                            onSelect={(currentValue) => {
                              const selectedOption = filteredOptions.find(
                                (option) =>
                                  option.value.toString().toLowerCase() ===
                                  currentValue.toLowerCase(),
                              );

                              if (selectedOption) {
                                setCachedSelectedItem(selectedOption);
                                const actualValue =
                                  selectedOption.value.toString();
                                const newValue =
                                  actualValue === value ? "" : actualValue;

                                if (type === "number") {
                                  field.onChange(
                                    newValue ? Number(newValue) : "",
                                  );
                                } else {
                                  field.onChange(newValue);
                                }
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
                                value === item.value.toString()
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
