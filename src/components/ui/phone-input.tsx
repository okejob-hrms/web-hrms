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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getCountryCodeOptions,
  getDefaultCountryCode,
} from "@/lib/country-codes";

interface PhoneInputProps {
  name?: string;
  label?: string;
  required?: boolean;
  className?: string;
  disabled?: boolean;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  name = "phone_number",
  label = "Phone Number",
  required = false,
  className,
  disabled = false,
}) => {
  const { control, watch, setValue } = useFormContext();
  const countryCodeOptions = getCountryCodeOptions();
  const countryCode = watch("countryCode") || getDefaultCountryCode();
  const phoneNumber = watch(name) || "";

  React.useEffect(() => {
    if (!watch("countryCode")) {
      setValue("countryCode", getDefaultCountryCode());
    }
  }, [setValue, watch]);

  const handleCountryCodeChange = (newCountryCode: string) => {
    setValue("countryCode", newCountryCode, { shouldValidate: true });

    const cleanPhoneNumber = phoneNumber.replace(/^\+\d+\s*/, "");
    const fullPhoneNumber = cleanPhoneNumber
      ? `${newCountryCode} ${cleanPhoneNumber}`
      : newCountryCode;
    setValue(name, fullPhoneNumber, { shouldValidate: true });
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    if (inputValue.startsWith("+")) {
      const match = inputValue.match(/^(\+\d+)\s*(.*)/);
      if (match) {
        const [, code, number] = match;
        setValue("countryCode", code);
        setValue(name, `${code}${number}`, { shouldValidate: true });
        return;
      }
    }

    const cleanNumber = inputValue.replace(/^\+\d+\s*/, ""); // Remove any country code prefix
    const fullPhoneNumber = cleanNumber
      ? `${countryCode}${cleanNumber}`
      : countryCode;
    setValue(name, fullPhoneNumber, { shouldValidate: true });
  };

  const getDisplayValue = () => {
    if (!phoneNumber) return "";
    return phoneNumber.replace(new RegExp(`^\\${countryCode}\\s*`), "");
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          {label && (
            <FormLabel className="text-sm font-normal">
              {label}
              {required && <span className="text-error">*</span>}
            </FormLabel>
          )}
          <div className="flex gap-2">
            <FormField
              control={control}
              name="countryCode"
              render={({ field: countryField }) => (
                <Select
                  value={countryField.value || getDefaultCountryCode()}
                  onValueChange={handleCountryCodeChange}
                  disabled={disabled}
                >
                  <FormControl>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="max-h-[200px]">
                    {countryCodeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <span className="font-mono">{option.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FormControl>
              <Input
                {...field}
                value={getDisplayValue()}
                onChange={handlePhoneNumberChange}
                placeholder="Enter phone number"
                disabled={disabled}
                className="flex-1"
              />
            </FormControl>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
