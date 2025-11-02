/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { countryCodes } from "@/lib/country-codes";
import { parsePhoneNumber, formatPhoneForDisplay } from "@/lib/phone-utils";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";

interface PhoneInputProps {
  name: string;
  countryCodeName?: string;
  label?: string;
  required?: boolean;
  className?: string;
  disabled?: boolean;
  placeholder?: string;
  helperText?: string;
}

const extractNumericPhone = (formattedPhone: string): string => {
  return formattedPhone.replace(/\D/g, "");
};

export const validatePhoneNumber = (value: string): boolean | string => {
  if (!value) return true;

  const cleanValue = value.replace(/\D/g, "");

  if (cleanValue.length < 3) {
    return "Phone number must be at least 3 digits";
  }
  if (cleanValue.length > 15) {
    return "Phone number must be no more than 15 digits";
  }
  return true;
};

const CountryCodeSelect = ({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) => {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const getCountryData = () => {
    return countryCodes.map((country) => ({
      value: country.code,
      label: `${country.flag} ${country.country} (${country.code})`,
      name: country.code,
      flag: country.flag,
      code: country.code,
    }));
  };

  const countryData = getCountryData();
  const selectedCountry = countryData.find((c) => c.code === value);

  const filteredCountries = countryData.filter((country) =>
    country.code.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-[140px] justify-between border border-input h-10"
        >
          <span className="flex items-center gap-2">
            {selectedCountry ? (
              <>
                <span>{selectedCountry.flag}</span>
                <span className="font-mono text-sm">
                  {selectedCountry.code}
                </span>
              </>
            ) : (
              "Select..."
            )}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Search country..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup>
              {filteredCountries.map((country) => (
                <CommandItem
                  key={country.code}
                  value={country.code}
                  onSelect={() => {
                    onChange(country.code);
                    setOpen(false);
                    setSearch("");
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === country.code ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <div className="flex flex-col">
                    <span className="font-medium">{country.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {country.code}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

const PhoneInputField = ({
  phoneValue,
  countryCode,
  onPhoneChange,
  onCountryCodeChange,
  onBlur,
  disabled,
  placeholder,
  error,
}: {
  phoneValue: string;
  countryCode: string;
  onPhoneChange: (value: string) => void;
  onCountryCodeChange: (value: string) => void;
  onBlur: () => void;
  disabled?: boolean;
  placeholder?: string;
  error?: boolean;
}) => {
  const [displayValue, setDisplayValue] = React.useState(
    formatPhoneForDisplay(phoneValue || ""),
  );

  React.useEffect(() => {
    setDisplayValue(formatPhoneForDisplay(phoneValue || ""));
  }, [phoneValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const formattedValue = formatPhoneForDisplay(inputValue);
    const numericValue = extractNumericPhone(formattedValue);

    setDisplayValue(formattedValue);
    onPhoneChange(numericValue);
  };

  return (
    <div className="flex w-full gap-2">
      <CountryCodeSelect
        value={countryCode}
        onChange={onCountryCodeChange}
        disabled={disabled}
      />
      <Input
        type="text"
        value={displayValue}
        onChange={handleChange}
        onBlur={onBlur}
        disabled={disabled}
        placeholder={placeholder}
        className={cn(
          "rounded-l-none",
          error && "border-red-500 focus-visible:ring-red-500",
        )}
      />
    </div>
  );
};

export const PhoneInput = ({
  name,
  countryCodeName,
  label,
  required = false,
  disabled = false,
  className,
  placeholder = "e.g. 123-456-7890",
  helperText,
}: PhoneInputProps) => {
  const { control, watch, setValue } = useFormContext();

  // Parse the current form value to get country code and phone number
  const currentValue = watch(name);
  const parsedPhone = React.useMemo(
    () => parsePhoneNumber(currentValue || ""),
    [currentValue],
  );

  const handlePhoneChange = (phoneNumber: string) => {
    const fullNumber = phoneNumber
      ? `${parsedPhone.countryCode}${phoneNumber}`
      : "";
    setValue(name, fullNumber, { shouldValidate: true });
  };

  const handleCountryCodeChange = (newCountryCode: string) => {
    const currentPhone = parsedPhone.phoneNumber;
    const fullNumber = currentPhone ? `${newCountryCode}${currentPhone}` : "";
    const countryCodeVal = newCountryCode.split("+")[1]
    setValue(name, fullNumber, { shouldValidate: true });
    countryCodeName && setValue(countryCodeName, countryCodeVal, { shouldValidate: true });
  };

  React.useEffect(() => {
    if (name && parsedPhone.phoneNumber)  {
      const currentPhone = parsedPhone.phoneNumber;
      setValue(name, currentPhone, { shouldValidate: true });
    }
    if (countryCodeName && parsedPhone.countryCode && parsedPhone.countryCode !== "+1") {
      const countryCodeVal = parsedPhone.countryCode.split("+")[1];
      setValue(countryCodeName, countryCodeVal, { shouldValidate: true });
    }
  }, [])

  return (
    <FormField
      control={control}
      name={name}
      rules={{
        validate: (value) => {
          if (!value) {
            if (required) return "Phone number is required";
            return true;
          }
          const parsed = parsePhoneNumber(value);
          return validatePhoneNumber(parsed.phoneNumber);
        },
      }}
      render={({ field, fieldState }) => (
        <FormItem className={className}>
          {label && (
            <FormLabel>
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </FormLabel>
          )}
          <FormControl>
            <PhoneInputField
              phoneValue={parsedPhone.phoneNumber}
              countryCode={parsedPhone.countryCode}
              onPhoneChange={handlePhoneChange}
              onCountryCodeChange={handleCountryCodeChange}
              onBlur={field.onBlur}
              disabled={disabled}
              placeholder={placeholder}
              error={!!fieldState.error}
            />
          </FormControl>
          <FormMessage />
          {helperText && (
            <p className="text-xs text-muted-foreground">{helperText}</p>
          )}
        </FormItem>
      )}
    />
  );
};
