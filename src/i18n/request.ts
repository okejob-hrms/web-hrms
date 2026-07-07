import { getRequestConfig } from 'next-intl/server';
import { cookies, headers } from 'next/headers';
import {
  DEFAULT_LOCALE,
  getLocaleFromAcceptLanguage,
  isAppLocale,
  LOCALE_COOKIE,
} from '@/lib/i18n/locale';

export default getRequestConfig(async ({ requestLocale }) => {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value;

  let locale: string | undefined = isAppLocale(cookieLocale)
    ? cookieLocale
    : undefined;

  if (!locale) {
    const requested = await requestLocale;
    locale = isAppLocale(requested) ? requested : undefined;
  }

  if (!locale) {
    const headerStore = await headers();
    locale = getLocaleFromAcceptLanguage(
      headerStore.get('accept-language'),
    );
  }

  const resolvedLocale = isAppLocale(locale) ? locale : DEFAULT_LOCALE;

  return {
    locale: resolvedLocale,
    messages: (await import(`../messages/${resolvedLocale}.json`)).default,
  };
});
