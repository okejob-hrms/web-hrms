'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import { postRequestReset } from '@/services/auth';
import { toast } from 'sonner';

export default function ResetPasswordPage() {
  const router = useRouter();
  const t = useTranslations('auth');
  const tCommon = useTranslations('common');
  const tToast = useTranslations('toast');
  const [email, setEmail] = useState('');

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      return postRequestReset({ email, client: 'web' });
    },
    onSuccess: () => {
      toast.success(tToast('resetMailSuccess'));
      router.push('/auth/mail-confirm');
    },
    onError: () => {
      toast.error(tToast('resetMailFailed'));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate();
  };

  const isEmailValid = email.trim() !== '' && /\S+@\S+\.\S+/.test(email);

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col justify-center px-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm font-medium mb-6"
      >
        <ArrowLeft className="h-5 w-5" /> {tCommon('back')}
      </button>

      <h1 className="text-2xl font-bold mb-1">{t('resetPassword')}</h1>
      <p className="text-muted-foreground mb-6">{t('resetPasswordSubtitle')}</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">{t('email')}</Label>
          <div className="relative">
            <Input
              id="email"
              type="email"
              placeholder={t('registeredEmailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full"
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={!isEmailValid || isPending}
          className="w-full"
        >
          {isPending ? tCommon('processing') : tCommon('continue')}
        </Button>
      </form>
    </div>
  );
}
