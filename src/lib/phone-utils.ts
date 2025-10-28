import { countryCodes, getDefaultCountryCode } from "./country-codes";

export interface ParsedPhoneNumber {
  countryCode: string;
  phoneNumber: string;
  fullNumber: string;
}

export function parsePhoneNumber(fullPhoneNumber: string): ParsedPhoneNumber {
  if (!fullPhoneNumber) {
    return {
      countryCode: getDefaultCountryCode(),
      phoneNumber: "",
      fullNumber: "",
    };
  }

  const cleanNumber = fullPhoneNumber.replace(/[^\d+]/g, "");

  let detectedCountryCode = getDefaultCountryCode();
  let phoneWithoutCountryCode = cleanNumber;

  const sortedCountryCodes = [...countryCodes].sort(
    (a, b) => b.code.length - a.code.length,
  );

  for (const country of sortedCountryCodes) {
    if (cleanNumber.startsWith(country.code)) {
      detectedCountryCode = country.code;
      phoneWithoutCountryCode = cleanNumber.slice(country.code.length);
      break;
    }
  }
  if (
    detectedCountryCode === getDefaultCountryCode() &&
    cleanNumber.startsWith("+")
  ) {
    for (let i = 4; i >= 1; i--) {
      const potentialCode = cleanNumber.slice(0, i + 1);
      const country = countryCodes.find((c) => c.code === potentialCode);
      if (country) {
        detectedCountryCode = country.code;
        phoneWithoutCountryCode = cleanNumber.slice(country.code.length);
        break;
      }
    }
  }

  const result = {
    countryCode: detectedCountryCode,
    phoneNumber: phoneWithoutCountryCode,
    fullNumber: `${detectedCountryCode}${phoneWithoutCountryCode}`,
  };

  return result;
}

export function formatPhoneForDisplay(phoneNumber: string): string {
  if (!phoneNumber) return "";

  const cleanValue = phoneNumber.replace(/\D/g, "");

  if (cleanValue.length <= 3) {
    return cleanValue;
  } else if (cleanValue.length <= 6) {
    return `${cleanValue.slice(0, 3)}-${cleanValue.slice(3)}`;
  } else if (cleanValue.length <= 10) {
    return `${cleanValue.slice(0, 3)}-${cleanValue.slice(3, 6)}-${cleanValue.slice(6)}`;
  } else {
    return `${cleanValue.slice(0, 3)}-${cleanValue.slice(3, 6)}-${cleanValue.slice(6, 10)}-${cleanValue.slice(10)}`;
  }
}
