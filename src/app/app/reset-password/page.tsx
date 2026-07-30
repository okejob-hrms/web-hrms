'use client';

import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';

const DEFAULT_MOBILE_DEEP_LINK_BASE = 'hrms-app://com.okjob.hrms';

function buildMobileDeepLink(token: string, email: string): string {
  const base = (
    process.env.NEXT_PUBLIC_MOBILE_DEEP_LINK_URL || DEFAULT_MOBILE_DEEP_LINK_BASE
  ).replace(/\/$/, '');
  const query = new URLSearchParams({ token, email }).toString();
  return `${base}/reset-password?${query}`;
}

export default function MobileResetPasswordBridgePage() {
  const searchParams = useSearchParams();
  const t = useTranslations('auth');
  const token = searchParams.get('token') ?? '';
  const email = searchParams.get('email') ?? '';

  const deepLink = useMemo(() => {
    if (!token || !email) {
      return null;
    }
    return buildMobileDeepLink(token, email);
  }, [token, email]);

  const webHref =
    token && email
      ? `/reset-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`
      : '/auth/reset-password';

  useEffect(() => {
    if (!deepLink) {
      return;
    }
    // Attempt to open ESS automatically when this HTTPS bridge is opened from email.
    window.location.href = deepLink;
  }, [deepLink]);

  if (!token || !email) {
    return (
      <div className="max-w-md mx-auto min-h-screen flex flex-col justify-center px-6 text-center">
        <h1 className="text-2xl font-bold mb-2">{t('resetPassword')}</h1>
        <p className="text-muted-foreground mb-6">{t('resetLinkInvalid')}</p>
        <Button asChild>
          <Link href="/auth/reset-password">{t('requestNewResetLink')}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col justify-center px-6 text-center">
      <h1 className="text-2xl font-bold mb-2">{t('openEssAppTitle')}</h1>
      <p className="text-muted-foreground mb-6">{t('openEssAppSubtitle')}</p>

      <div className="flex flex-col gap-3">
        <Button asChild className="w-full">
          <a href={deepLink ?? '#'}>{t('openEssAppCta')}</a>
        </Button>
        <Button asChild variant="outline" className="w-full">
          <Link href={webHref}>{t('continueResetOnWeb')}</Link>
        </Button>
      </div>

      <p className="text-sm text-muted-foreground mt-6">
        {t('openEssAppHint')}
      </p>
    </div>
  );
}
