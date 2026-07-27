'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import ResetPasswordTokenPage from '@/components/pages/auth-reset-password-token';

export default function ResetPasswordEntryPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  useEffect(() => {
    if (!token && !email) {
      router.replace('/auth/reset-password');
    }
  }, [token, email, router]);

  if (!token || !email) {
    return null;
  }

  return <ResetPasswordTokenPage />;
}
