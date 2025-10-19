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
import { countryCodes, getDefaultCountryCode } from "@/lib/country-codes";
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

const formatPhoneNumber = (value: string): string => {
  const cleanValue = value.replace(/\D/g, "");

  if (cleanValue.length <= 3) {
    return cleanValue;
  } else if (cleanValue.length <= 6) {
    return `${cleanValue.slice(0, 3)}-${cleanValue.slice(3)}`;
  } else if (cleanValue.length <= 10) {
    return `${cleanValue.slice(0, 3)}-${cleanValue.slice(3, 6)}-${cleanValue.slice(6)}`;
  } else {
    return `${cleanValue.slice(0, 3)}-${cleanValue.slice(3, 6)}-${cleanValue.slice(6, 10)}-${cleanValue.slice(10)}`;
  }
};

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
      label: `${country.flag} ${country.country}`,
      name: country.code,
      flag: country.flag,
      code: country.code,
    }));
  };

  const countryData = getCountryData();
  const selectedCountry = countryData.find((c) => c.code === value);

  const filteredCountries = countryData.filter(
    (country) =>
      country.code.toLowerCase().includes(search.toLowerCase()) ||
      country.code.includes(search),
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
                <span className="font-mono">{selectedCountry.code}</span>
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
    formatPhoneNumber(phoneValue || ""),
  );

  React.useEffect(() => {
    setDisplayValue(formatPhoneNumber(phoneValue || ""));
  }, [phoneValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const formattedValue = formatPhoneNumber(inputValue);
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
  label,
  required = false,
  disabled = false,
  className,
  placeholder = "e.g. 123-456-7890",
  helperText,
}: PhoneInputProps) => {
  const { control, watch, setValue } = useFormContext();
  const [internalCountryCode, setInternalCountryCode] = React.useState(
    getDefaultCountryCode(),
  );

  React.useEffect(() => {
    const currentValue = watch(name);
    if (currentValue) {
      const matchedCountry = countryCodes.find((country) =>
        currentValue.startsWith(country.code),
      );
      if (matchedCountry) {
        setInternalCountryCode(matchedCountry.code);
      }
    }
  }, [name, watch]);

  const handlePhoneChange = (phoneNumber: string) => {
    const fullNumber = phoneNumber
      ? `${internalCountryCode}${phoneNumber}`
      : "";
    setValue(name, fullNumber, { shouldValidate: true });
  };

  const handleCountryCodeChange = (newCountryCode: string) => {
    setInternalCountryCode(newCountryCode);
    const currentValue = watch(name) || "";
    const currentPhone = currentValue.replace(/^\+\d+/, "");
    const fullNumber = currentPhone ? `${newCountryCode}${currentPhone}` : "";
    setValue(name, fullNumber, { shouldValidate: true });
  };

  const getPhoneNumberOnly = (fullValue: string): string => {
    if (!fullValue) return "";
    return fullValue.replace(/^\+\d+/, "");
  };

  return (
    <FormField
      control={control}
      name={name}
      rules={{
        validate: (value) => {
          if (!value) return true;
          const phoneOnly = value.replace(/^\+\d+/, "");
          return validatePhoneNumber(phoneOnly);
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
              phoneValue={getPhoneNumberOnly(field.value || "")}
              countryCode={internalCountryCode}
              onPhoneChange={handlePhoneChange}
              onCountryCodeChange={handleCountryCodeChange}
              onBlur={field.onBlur}
              disabled={disabled}
              placeholder={placeholder}
              error={!!fieldState.error}
            />
          </FormControl>
          <FormMessage />
          <p className="text-xs text-muted-foreground">{helperText}</p>
        </FormItem>
      )}
    />
  );
};

// export const PhoneInput: React.FC<PhoneInputProps> = ({
//   name = "phone_number",
//   label = "Phone Number",
//   required = false,
//   className,
//   disabled = false,
// }) => {
//   const { control, watch, setValue } = useFormContext();
//   const countryCodeOptions = getCountryCodeOptions();
//   const countryCode = watch("countryCode") || getDefaultCountryCode();
//   const phoneNumber = watch(name) || "";

//   React.useEffect(() => {
//     if (!watch("countryCode")) {
//       setValue("countryCode", getDefaultCountryCode());
//     }
//   }, [setValue, watch]);

//   const handleCountryCodeChange = (newCountryCode: string) => {
//     setValue("countryCode", newCountryCode, { shouldValidate: true });

//     const cleanPhoneNumber = phoneNumber.replace(/^\+\d+\s*/, "");
//     const fullPhoneNumber = cleanPhoneNumber
//       ? `${newCountryCode} ${cleanPhoneNumber}`
//       : newCountryCode;
//     setValue(name, fullPhoneNumber, { shouldValidate: true });
//   };

//   const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const inputValue = e.target.value;

//     if (inputValue.startsWith("+")) {
//       const match = inputValue.match(/^(\+\d+)\s*(.*)/);
//       if (match) {
//         const [, code, number] = match;
//         setValue("countryCode", code);
//         setValue(name, `${code}${number}`, { shouldValidate: true });
//         return;
//       }
//     }

//     const cleanNumber = inputValue.replace(/^\+\d+\s*/, "");
//     const fullPhoneNumber = cleanNumber
//       ? `${countryCode}${cleanNumber}`
//       : countryCode;
//     setValue(name, fullPhoneNumber, { shouldValidate: true });
//   };

//   const getDisplayValue = () => {
//     if (!phoneNumber) return "";
//     return phoneNumber.replace(new RegExp(`^\\${countryCode}\\s*`), "");
//   };

//   return (
//     <FormField
//       control={control}
//       name={name}
//       render={({ field }) => (
//         <FormItem className={className}>
//           {label && (
//             <FormLabel className="text-sm font-normal">
//               {label}
//               {required && <span className="text-error">*</span>}
//             </FormLabel>
//           )}
//           <div className="flex gap-2">
//             <FormField
//               control={control}
//               name="countryCode"
//               render={({ field: countryField }) => (
//                 <Select
//                   value={countryField.value || getDefaultCountryCode()}
//                   onValueChange={handleCountryCodeChange}
//                   disabled={disabled}
//                 >
//                   <FormControl>
//                     <SelectTrigger className="w-[120px]">
//                       <SelectValue />
//                     </SelectTrigger>
//                   </FormControl>
//                   <SelectContent className="max-h-[200px]">
//                     {countryCodeOptions.map((option) => (
//                       <SelectItem key={option.value} value={option.value}>
//                         <span className="font-mono">{option.label}</span>
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               )}
//             />
//             <FormControl>
//               <Input
//                 {...field}
//                 value={getDisplayValue()}
//                 onChange={handlePhoneNumberChange}
//                 placeholder="Enter phone number"
//                 disabled={disabled}
//                 className="flex-1"
//               />
//             </FormControl>
//           </div>
//           <FormMessage />
//         </FormItem>
//       )}
//     />
//   );
// };
