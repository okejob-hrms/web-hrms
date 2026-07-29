import { z } from "zod";
import dayjs from "dayjs";
import {
  formatCurrencyIdr,
  formatDateTime as formatDateTimeLocalized,
  formatDateRange as formatDateRangeLocalized,
  formatDayCount,
} from "@/lib/formatting";
import type { AppLocale } from "@/lib/i18n/locale";
import { DEFAULT_LOCALE, resolveLocale } from "@/lib/i18n/locale";
import {
  resolveBusinessTripStatusKey,
  resolveOvertimeStatusKey,
  resolveSelfAssessmentStatusKey,
  resolveStatusKey,
  type StatusKey,
} from "@/lib/i18n/status";

export const rupiahFormatter = (number: number) => formatCurrencyIdr(number);

/** Build a public file URL from a storage path (matches usage across the app). */
export function getPublicFileUrl(path?: string | null): string {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const base = process.env.NEXT_PUBLIC_FILE_URL?.replace(/\/$/, "") ?? "";
  const normalizedPath = path.replace(/^\//, "");
  return base ? `${base}/${normalizedPath}` : `/${normalizedPath}`;
}

/** @deprecated Pass locale — defaults to en for backward compatibility */
export function formatDateTime(isoString: string, locale: AppLocale = "en") {
  return formatDateTimeLocalized(isoString, locale);
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
type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

interface StatusConfig {
  key: StatusKey;
  variant: BadgeVariant;
  className?: string;
  circleClassName?: string;
}

function emptyStatus(): StatusConfig {
  return { key: "unknown", variant: "default" };
}

export function getStatusAttendance(status?: string): StatusConfig {
  if (!status) {
    return emptyStatus();
  }

  const key = resolveStatusKey(status);
  let variant: BadgeVariant = "default";
  let className = "";

  switch (key) {
    case "approved":
      variant = "secondary";
      className = "bg-green-100 text-green-700";
      break;
    case "waiting":
    case "waitingForApproval":
      variant = "secondary";
      className = "bg-yellow-100 text-yellow-700";
      break;
    case "rejected":
      variant = "destructive";
      break;
    default:
      break;
  }

  return { key, variant, className };
}

export function getStatusBusinessTrip(status?: number): StatusConfig {
  const key = resolveBusinessTripStatusKey(status);

  switch (key) {
    case "waiting":
      return {
        key,
        variant: "secondary",
        className: "bg-yellow-100 text-yellow-700",
      };
    case "approved":
      return {
        key,
        variant: "secondary",
        className: "bg-green-100 text-green-700",
      };
    case "rejected":
      return { key, variant: "destructive" };
    case "cancelled":
      return {
        key,
        variant: "secondary",
        className: "bg-gray-100 text-gray-700",
      };
    default:
      return emptyStatus();
  }
}

export function getStatusOvertime(status?: number): StatusConfig {
  if (!status) {
    return emptyStatus();
  }

  const key = resolveOvertimeStatusKey(status);
  let variant: BadgeVariant = "default";
  let className = "";

  switch (key) {
    case "waitingForApproval":
      variant = "secondary";
      className = "bg-yellow-100 text-yellow-700";
      break;
    case "approved":
      variant = "default";
      className = "bg-green-100 text-green-700";
      break;
    case "rejected":
      variant = "destructive";
      break;
    default:
      break;
  }

  return { key, variant, className };
}

export async function getLocationDetail(lat: string, lng: string) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
  );

  if (!res.ok) throw new Error("Failed to fetch location");

  const data = await res.json();
  return data.display_name || "Unknown location";
}

export function getStatusPayroll(status?: string): StatusConfig {
  if (!status) {
    return emptyStatus();
  }

  const key = resolveStatusKey(status);
  let variant: BadgeVariant = "default";
  let className = "";

  switch (key) {
    case "draft":
      variant = "secondary";
      className = "bg-gray-100 text-gray-700";
      break;
    case "final":
      variant = "secondary";
      className = "bg-green-100 text-green-700";
      break;
    case "pending":
    case "waitingForApproval":
      variant = "secondary";
      className = "bg-yellow-100 text-yellow-700";
      break;
    case "rejected":
      variant = "destructive";
      break;
    default:
      break;
  }

  return { key, variant, className };
}

export function getStatusPayrollReq(status?: string): StatusConfig {
  if (!status) {
    return emptyStatus();
  }

  const key = resolveStatusKey(status);
  let variant: BadgeVariant = "default";
  let className = "";

  switch (key) {
    case "approved":
      variant = "secondary";
      className = "bg-green-100 text-green-700";
      break;
    case "pending":
      variant = "secondary";
      className = "bg-yellow-100 text-yellow-700";
      break;
    case "rejected":
      variant = "destructive";
      break;
    default:
      break;
  }

  return { key, variant, className };
}

export function getStatusGeneratingPayroll(status?: string): StatusConfig {
  if (!status) {
    return emptyStatus();
  }

  const key = resolveStatusKey(status);
  let variant: BadgeVariant = "default";
  let className = "";

  switch (key) {
    case "pending":
      variant = "secondary";
      className = "bg-yellow-100 text-yellow-700";
      break;
    case "completed":
      variant = "secondary";
      className = "bg-green-100 text-green-700";
      break;
    case "failed":
      variant = "destructive";
      break;
    default:
      break;
  }

  return { key, variant, className };
}

export function formatDayDifference(
  startDate: string,
  endDate: string,
  locale?: AppLocale,
): string {
  // Prefer calendar-date parsing so ISO UTC datetimes (or Y-m-d) don't shift.
  const start = dayjs(parseCalendarDateForDiff(startDate));
  const end = dayjs(parseCalendarDateForDiff(endDate));
  // Inclusive calendar days (same-day = 1), matching backend/mobile.
  const days = Math.max(0, end.diff(start, 'day') + 1);

  return formatDayCount(days, resolveLocale(locale ?? DEFAULT_LOCALE));
}

function parseCalendarDateForDiff(value: string): Date {
  const trimmed = value.trim();
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (match) {
    return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  }
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    return new Date(NaN);
  }
  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
}

/**
 * Prefer API chargeable `day` (supports 0.5) when present; otherwise inclusive calendar fallback.
 */
export function formatLeaveDuration(
  startDate?: string | null,
  endDate?: string | null,
  locale?: AppLocale,
  apiDay?: number | string | null,
): string {
  const resolvedLocale = resolveLocale(locale ?? DEFAULT_LOCALE);

  if (apiDay !== null && apiDay !== undefined && apiDay !== '') {
    const parsed = typeof apiDay === 'number' ? apiDay : Number(apiDay);
    if (!Number.isNaN(parsed)) {
      return formatDayCount(parsed, resolvedLocale);
    }
  }

  if (!startDate || !endDate) {
    return '-';
  }

  return formatDayDifference(startDate, endDate, resolvedLocale);
}

export function formatDateRange(
  startDate: string,
  endDate: string,
  locale: AppLocale = DEFAULT_LOCALE,
): string {
  return formatDateRangeLocalized(startDate, endDate, locale);
}

export function getStatusEmployeeAssessment(status: string): StatusConfig {
  const key = resolveStatusKey(status);
  let variant: BadgeVariant = "default";
  let className = "";
  let circleClassName = "";

  switch (key) {
    case "notStarted":
      variant = "secondary";
      className = "bg-error-focused text-error-hover";
      circleClassName = "bg-error-hover";
      break;
    case "inProgress":
      variant = "secondary";
      className = "bg-success-focused text-success-hover";
      circleClassName = "bg-success-hover";
      break;
    case "validated":
      variant = "secondary";
      className = "bg-primary text-white";
      circleClassName = "bg-white";
      break;
    case "completed":
      variant = "secondary";
      className = "bg-primary-focused text-primary-hover";
      circleClassName = "bg-primary-hover";
      break;
    default:
      break;
  }

  return { key, variant, className, circleClassName };
}

export function getStatusSelfAssessment(status: number): StatusConfig {
  const key = resolveSelfAssessmentStatusKey(status);
  let variant: BadgeVariant = "default";
  let className = "";

  switch (key) {
    case "active":
      variant = "secondary";
      className = "bg-success-focused text-success-hover";
      break;
    case "completed":
      variant = "secondary";
      className = "bg-primary-focused text-primary-hover";
      break;
    case "expired":
      variant = "destructive";
      break;
    default:
      break;
  }

  return { key, variant, className };
}

export function getStatusOKRCycle(statusLabel?: string): StatusConfig {
  if (!statusLabel) {
    return emptyStatus();
  }

  const key = resolveStatusKey(statusLabel);
  let variant: BadgeVariant = "default";
  let className = "";
  let circleClassName = "";

  switch (key) {
    case "draft":
      variant = "secondary";
      className = "bg-gray-100 text-gray-700";
      circleClassName = "bg-gray-700";
      break;
    case "active":
      variant = "secondary";
      className = "bg-success-focused text-success-hover";
      circleClassName = "bg-success-hover";
      break;
    case "completed":
      variant = "secondary";
      className = "bg-primary-focused text-primary-hover";
      circleClassName = "bg-primary-hover";
      break;
    case "archived":
      variant = "secondary";
      className = "bg-gray-200 text-gray-600";
      circleClassName = "bg-gray-600";
      break;
    default:
      break;
  }

  return { key, variant, className, circleClassName };
}
