import { z } from "zod";

export const rupiahFormatter = (number: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
  }).format(number);
};
export function formatDateTime(isoString: string) {
  const dateObj = new Date(isoString);

  const date = dateObj.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const hour = dateObj.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return { date, hour };
}

export function snakeToTitleCase(str: string): string {
  if (!str) return "";

  return str
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export const cleanPhoneNumber = (phone: string): string => {
  return phone.replace(/[^\d+]/g, "").replace(/\+(?!^)/g, "");
};

export const convertPhoneToNumber = (phoneInput: string): string => {
  if (!phoneInput) return "";
  const cleaned = cleanPhoneNumber(phoneInput);
  const numbersOnly = cleaned.replace(/^\+/, "");

  return numbersOnly;
};

export const formatPhoneNumber = (phone: string): string => {
  const cleaned = convertPhoneToNumber(phone);

  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }

  if (cleaned.length === 11 && cleaned.startsWith("1")) {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }

  if (cleaned.length > 10) {
    return `+${cleaned}`;
  }

  return phone;
};

export const phoneNumberSchema = z
  .string()
  .min(1, "Phone number is required")
  .refine(
    (phone) => {
      const cleaned = cleanPhoneNumber(phone);
      return /^\+?\d{10,15}$/.test(cleaned);
    },
    {
      message: "Please enter a valid phone number (10-15 digits)",
    },
  );

export const usPhoneNumberSchema = z
  .string()
  .min(1, "Phone number is required")
  .refine(
    (phone) => {
      const cleaned = cleanPhoneNumber(phone);
      return /^(\+?1)?[2-9]\d{2}[2-9]\d{2}\d{4}$/.test(cleaned);
    },
    {
      message: "Please enter a valid US phone number",
    },
  );

export const internationalPhoneSchema = z
  .string()
  .min(1, "Phone number is required")
  .refine(
    (phone) => {
      const cleaned = cleanPhoneNumber(phone);
      return /^\+\d{8,15}$/.test(cleaned);
    },
    {
      message:
        "Please enter a valid international phone number starting with +",
    },
  );

export const flexiblePhoneSchema = z
  .string()
  .min(1, "Phone number is required")
  .transform((phone) => cleanPhoneNumber(phone))
  .refine(
    (cleaned) => {
      return /^\+?\d{10,15}$/.test(cleaned);
    },
    {
      message: "Please enter a valid phone number (10-15 digits)",
    },
  )
  .transform((cleaned) => {
    return cleaned.startsWith("+") ? cleaned : `+${cleaned}`;
  });

export const optionalPhoneSchema = z
  .string()
  .optional()
  .refine(
    (phone) => {
      if (!phone || phone.trim() === "") return true;
      const cleaned = cleanPhoneNumber(phone);
      return /^\+?\d{10,15}$/.test(cleaned);
    },
    {
      message: "Please enter a valid phone number or leave empty",
    },
  );

export const detailedPhoneSchema = z
  .string()
  .min(1, "Phone number is required")
  .refine(
    (phone) => {
      const cleaned = cleanPhoneNumber(phone);
      return cleaned.length >= 10;
    },
    {
      message: "Phone number must be at least 10 digits",
    },
  )
  .refine(
    (phone) => {
      const cleaned = cleanPhoneNumber(phone);
      return cleaned.length <= 15;
    },
    {
      message: "Phone number cannot exceed 15 digits",
    },
  )
  .refine(
    (phone) => {
      const cleaned = cleanPhoneNumber(phone);
      return /^\+?\d+$/.test(cleaned);
    },
    {
      message:
        "Phone number can only contain digits and optional + at the beginning",
    },
  );

export const validatePhoneNumber = (phone: string) => {
  try {
    phoneNumberSchema.parse(phone);
    return { isValid: true, error: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { isValid: false, error: error.message || "Invalid phone number" };
    }
    return { isValid: false, error: "Validation error" };
  }
};

export const usePhoneValidation = () => {
  const validate = (phone: string) => validatePhoneNumber(phone);

  const format = (phone: string) => formatPhoneNumber(phone);

  const convert = (phone: string) => convertPhoneToNumber(phone);

  return { validate, format, convert };
};


// helpers attendance
type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

interface StatusConfig {
  variant: BadgeVariant;
  className?: string;
  label: string;
}

export function getStatusAttendance(status?: string): StatusConfig {
  if (!status) {
    return {
      variant: 'default',
      label: '-',
    };
  }

  let variant: BadgeVariant = 'default';
  let className = '';

  switch (status) {
    case 'Approved':
      variant = 'secondary';
      className = 'bg-green-100 text-green-700';
      break;
    case 'Waiting':
    case 'Waiting for Approval':
      variant = 'secondary';
      className = 'bg-yellow-100 text-yellow-700';
      break;
    case 'Rejected':
      variant = 'destructive';
      break;
  }

  return { variant, className, label: status };
}

export function getStatusOvertime(status?: number): StatusConfig {
  if (!status) {
    return {
      variant: 'default',
      label: '-',
    };
  }

  let variant: BadgeVariant = 'default';
  let className = '';

  switch (status) {
    case 1:
      variant = 'secondary';
      className = 'bg-yellow-100 text-yellow-700';
      break;
    case 2:
      variant = 'default';
      className = 'bg-green-100 text-green-700';
      break;
    case 3:
      variant = 'destructive';
      break;
  }

  return { variant, className, label: status === 1 ? 'Waiting for Approval' : status === 2 ? 'Approved' : 'Rejected'  };
}

export async function getLocationDetail(lat: string, lng: string) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
  );

  if (!res.ok) throw new Error("Failed to fetch location");

  const data = await res.json();
  return data.display_name || "Unknown location";
}

export function getStatusPayroll(status?: string): StatusConfig {
  if (!status) {
    return {
      variant: 'default',
      label: '-',
    };
  }

  let variant: BadgeVariant = 'default';
  let className = '';

  switch (status) {
    case 'Draft':
      variant = 'secondary';
      className = 'bg-gray-100 text-gray-700';
      break;
    case 'Payslip Sent':
      variant = 'secondary';
      className = 'bg-green-100 text-green-700';
      break;
    case 'Pending':
    case 'Waiting for Approval':
      variant = 'secondary';
      className = 'bg-yellow-100 text-yellow-700';
      break;
    case 'Rejected':
      variant = 'destructive';
      break;
  }

  return { variant, className, label: status };
}


export function getStatusGeneratingPayroll(status?: string): StatusConfig {
  if (!status) {
    return {
      variant: 'default',
      label: '-',
    };
  }

  let variant: BadgeVariant = 'default';
  let className = '';

  switch (status) {
    case 'Waiting':
      variant = 'secondary';
      className = 'bg-yellow-100 text-yellow-700';
      break;
    case 'Done':
      variant = 'secondary';
      className = 'bg-green-100 text-green-700';
      break;
    case 'Failed':
      variant = 'destructive';
      break;
  }

  return { variant, className, label: status };
}
