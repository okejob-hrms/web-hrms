/** Indonesia IANA timezones (WIB / WITA / WIT). @see https://en.wikipedia.org/wiki/Time_in_Indonesia */
export const INDONESIA_TIMEZONES = [
  "Asia/Jakarta",
  "Asia/Pontianak",
  "Asia/Makassar",
  "Asia/Jayapura",
] as const;

export type IndonesiaTimezoneId = (typeof INDONESIA_TIMEZONES)[number];

export const DEFAULT_INDONESIA_TIMEZONE: IndonesiaTimezoneId = "Asia/Jakarta";

export const INDONESIA_TIMEZONE_MESSAGE_KEYS: Record<
  IndonesiaTimezoneId,
  string
> = {
  "Asia/Jakarta": "timezoneWibJakarta",
  "Asia/Pontianak": "timezoneWibPontianak",
  "Asia/Makassar": "timezoneWitaMakassar",
  "Asia/Jayapura": "timezoneWitJayapura",
};

export function indonesiaTimezoneAbbr(timezone?: string | null): string {
  switch (timezone) {
    case "Asia/Makassar":
      return "WITA";
    case "Asia/Jayapura":
      return "WIT";
    case "Asia/Pontianak":
    case "Asia/Jakarta":
    default:
      return "WIB";
  }
}

export function normalizeIndonesiaTimezone(
  timezone?: string | null,
): IndonesiaTimezoneId {
  if (
    timezone &&
    (INDONESIA_TIMEZONES as readonly string[]).includes(timezone)
  ) {
    return timezone as IndonesiaTimezoneId;
  }
  return DEFAULT_INDONESIA_TIMEZONE;
}

function utcOffsetHours(timezone?: string | null): number {
  switch (normalizeIndonesiaTimezone(timezone)) {
    case "Asia/Makassar":
      return 8;
    case "Asia/Jayapura":
      return 9;
    case "Asia/Pontianak":
    case "Asia/Jakarta":
    default:
      return 7;
  }
}

/** Today's Y-m-d in a branch IANA zone (fixed UTC offset; no DST). */
export function todayInIndonesiaTimezone(timezone?: string | null): string {
  const offsetHours = utcOffsetHours(timezone);
  const now = new Date();
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60_000;
  const local = new Date(utcMs + offsetHours * 3_600_000);
  const y = local.getUTCFullYear();
  const m = String(local.getUTCMonth() + 1).padStart(2, "0");
  const d = String(local.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
