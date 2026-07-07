export const LOCALE_COOKIE = 'NEXT_LOCALE';
export const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

export const LOCALES = ['en', 'id'] as const;
export type AppLocale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: AppLocale = 'en';

export const LOCALE_OPTIONS = [
  { id: 'en' as const, name: 'English' },
  { id: 'id' as const, name: 'Bahasa Indonesia' },
] as const;

export function isAppLocale(value: string | undefined | null): value is AppLocale {
  return value === 'en' || value === 'id';
}

export function resolveLocale(value: string | undefined | null): AppLocale {
  return isAppLocale(value) ? value : DEFAULT_LOCALE;
}

export function getLocaleFromAcceptLanguage(header: string | null): AppLocale {
  if (!header) return DEFAULT_LOCALE;
  const lower = header.toLowerCase();
  if (lower.includes('id')) return 'id';
  return DEFAULT_LOCALE;
}

export function getLocaleFromCookieString(cookieHeader: string | undefined): AppLocale {
  if (!cookieHeader) return DEFAULT_LOCALE;
  const match = cookieHeader.match(
    new RegExp(`(?:^|; )${LOCALE_COOKIE}=([^;]*)`),
  );
  const value = match ? decodeURIComponent(match[1]) : '';
  return resolveLocale(value);
}

export function getLocaleFromDocumentCookie(): AppLocale {
  if (typeof document === 'undefined') return DEFAULT_LOCALE;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${LOCALE_COOKIE}=([^;]*)`),
  );
  const value = match ? decodeURIComponent(match[1]) : '';
  return resolveLocale(value);
}

export function setLocaleCookie(locale: AppLocale) {
  const expires = new Date(Date.now() + ONE_YEAR_MS).toUTCString();
  document.cookie = `${LOCALE_COOKIE}=${encodeURIComponent(locale)}; expires=${expires}; path=/`;
}

/** BCP 47 tag for Intl formatters from app locale */
export function toIntlLocale(locale: AppLocale): string {
  return locale === 'id' ? 'id-ID' : 'en-US';
}
