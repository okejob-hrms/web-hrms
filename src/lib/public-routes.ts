/**
 * Routes reachable without an authenticated session.
 * Keep AuthGuard and AppLayout in sync via this helper.
 */
export function isPublicPath(pathname: string): boolean {
  // Email reset links land on /reset-password (web) and /app/reset-password (ESS bridge),
  // outside /auth — must stay reachable without a session.
  return (
    pathname.startsWith('/auth') ||
    pathname.startsWith('/docs') ||
    pathname === '/reset-password' ||
    pathname.startsWith('/reset-password/') ||
    pathname === '/app/reset-password' ||
    pathname.startsWith('/app/reset-password/')
  );
}
