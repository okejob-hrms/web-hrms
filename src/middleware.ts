import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const LOCALE_COOKIE = 'NEXT_LOCALE';
const LOCALES = ['en', 'id'] as const;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === '/docs' || pathname === '/docs/' || pathname.startsWith('/docs/')) {
    const locale =
      LOCALES.find((l) => request.cookies.get(LOCALE_COOKIE)?.value === l) ?? 'en';
    const afterDocs = pathname.slice('/docs'.length).replace(/^\/+/, '') || '';
    const firstSegment = afterDocs.split('/')[0];
    if (firstSegment === 'en' || firstSegment === 'id') {
      return NextResponse.next();
    }
    const rest = pathname === '/docs' || pathname === '/docs/' ? '' : pathname.slice('/docs'.length);
    const url = request.nextUrl.clone();
    url.pathname = `/docs/${locale}${rest}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/docs', '/docs/:path*'],
};
