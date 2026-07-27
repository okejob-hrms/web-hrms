'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff } from 'lucide-react';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { useEffect, useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { postResetPassword } from '@/services/auth';
import { toast } from 'sonner';
import { createResetPasswordSchema } from '@/lib/validation/schemas';

export default function ResetPasswordTokenPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('auth');
  const tCommon = useTranslations('common');
  const tValidation = useTranslations('validation');
  const tToast = useTranslations('toast');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const token = searchParams.get('token') ?? '';
  const emailFromQuery = searchParams.get('email') ?? '';

  const formSchema = useMemo(
    () => createResetPasswordSchema(tValidation),
    [tValidation],
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: emailFromQuery,
      password: '',
      password_confirmation: '',
    },
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  useEffect(() => {
    form.reset({
      email: emailFromQuery,
      password: '',
      password_confirmation: '',
    });
  }, [emailFromQuery, form]);

  const mutation = useMutation({
    mutationFn: postResetPassword,
    onSuccess: () => {
      toast.success(tToast('passwordChanged'));
      router.push('/auth/success-change-password');
    },
    onError: () => {
      toast.error(tToast('passwordChangeFailed'));
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!token) {
      toast.error(tToast('passwordChangeFailed'));
      return;
    }

    mutation.mutate({
      token,
      email: values.email,
      password: values.password,
      password_confirmation: values.password_confirmation,
    });
  };

  if (!token || !emailFromQuery) {
    return (
      <div className="max-w-md mx-auto min-h-screen flex flex-col justify-center px-6 text-center">
        <h1 className="text-2xl font-bold mb-2">{t('resetPassword')}</h1>
        <p className="text-muted-foreground mb-6">{t('resetLinkInvalid')}</p>
        <Button onClick={() => router.push('/auth/reset-password')}>
          {t('requestNewResetLink')}
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col justify-center px-6">
      <h1 className="text-2xl font-bold mb-1">{t('createNewPassword')}</h1>
      <p className="text-muted-foreground mb-6">
        {t('createNewPasswordSubtitle')}
      </p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('email')}</FormLabel>
                <FormControl>
                  <Input type="email" disabled {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('newPassword')}</FormLabel>
                <FormControl>
                  <div className="relative w-full">
                    <Input
                      placeholder={t('newPasswordPlaceholder')}
                      type={showPassword ? 'text' : 'password'}
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password_confirmation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('newPasswordConfirmation')}</FormLabel>
                <FormControl>
                  <div className="relative w-full">
                    <Input
                      placeholder={t('confirmPasswordPlaceholder')}
                      type={showPasswordConfirm ? 'text' : 'password'}
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPasswordConfirm(!showPasswordConfirm)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                    >
                      {showPasswordConfirm ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full"
            disabled={!form.formState.isValid || mutation.isPending}
          >
            {mutation.isPending ? tCommon('processing') : tCommon('continue')}
          </Button>
        </form>
      </Form>
    </div>
  );
}
