import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  getLocaleFromAcceptLanguage,
  LOCALE_COOKIE,
  resolveLocale,
} from '@/lib/i18n/locale';

function ensureLocaleCookie(
  request: NextRequest,
  response: NextResponse,
): NextResponse {
  const existing = request.cookies.get(LOCALE_COOKIE)?.value;
  if (!existing || (existing !== 'en' && existing !== 'id')) {
    const locale = resolveLocale(
      getLocaleFromAcceptLanguage(request.headers.get('accept-language')),
    );
    response.cookies.set(LOCALE_COOKIE, locale, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
    });
  }
  return response;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const cookieLocale =
    request.cookies.get(LOCALE_COOKIE)?.value ??
    getLocaleFromAcceptLanguage(request.headers.get('accept-language'));

  if (
    pathname === '/docs' ||
    pathname === '/docs/' ||
    pathname.startsWith('/docs/')
  ) {
    const locale = resolveLocale(cookieLocale);
    const afterDocs = pathname.slice('/docs'.length).replace(/^\/+/, '') || '';
    const firstSegment = afterDocs.split('/')[0];

    if (firstSegment === 'en' || firstSegment === 'id') {
      const response = NextResponse.next();
      return ensureLocaleCookie(request, response);
    }

    const rest =
      pathname === '/docs' || pathname === '/docs/'
        ? ''
        : pathname.slice('/docs'.length);
    const url = request.nextUrl.clone();
    url.pathname = `/docs/${locale}${rest}`;
    const response = NextResponse.redirect(url);
    return ensureLocaleCookie(request, response);
  }

  // App routes stay at their original paths (no /en prefix rewrite).
  // Locale is resolved from NEXT_LOCALE cookie in src/i18n/request.ts.
  const response = NextResponse.next();
  return ensureLocaleCookie(request, response);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
