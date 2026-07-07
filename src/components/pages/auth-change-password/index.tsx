'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { useMemo, useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { postChangePassword } from '@/services/auth';
import { toast } from 'sonner';
import { createChangePasswordSchema } from '@/lib/validation/schemas';

export default function ChangePasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('auth');
  const tCommon = useTranslations('common');
  const tValidation = useTranslations('validation');
  const tToast = useTranslations('toast');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [storedEmail, setStoredEmail] = useState('');

  const formSchema = useMemo(
    () => createChangePasswordSchema(tValidation),
    [tValidation],
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      current_password: '',
      new_password: '',
      new_password_confirmation: '',
    },
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const rawUser = localStorage.getItem('user');
    if (!rawUser) return;

    try {
      const user = JSON.parse(rawUser) as { email?: string };
      if (user?.email) {
        setStoredEmail(user.email);
      }
    } catch {
      // Ignore malformed localStorage content.
    }
  }, []);

  useEffect(() => {
    const emailFromQuery = searchParams.get('email') ?? '';
    const resolvedEmail = emailFromQuery || storedEmail;

    form.reset({
      email: resolvedEmail,
      current_password: '',
      new_password: '',
      new_password_confirmation: '',
    });
  }, [searchParams, storedEmail, form]);

  const mutation = useMutation({
    mutationFn: postChangePassword,
    onSuccess: () => {
      toast.success(tToast('passwordChanged'));
      router.push('/auth/success-change-password');
    },
    onError: () => {
      toast.error(tToast('passwordChangeFailed'));
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    mutation.mutate({
      current_password: values.current_password,
      new_password: values.new_password,
      new_password_confirmation: values.new_password_confirmation,
    });
  };

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col justify-center px-6">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm font-medium mb-6 w-fit"
      >
        <ArrowLeft className="h-5 w-5" /> {tCommon('back')}
      </Button>

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
            name="current_password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('currentPassword')}</FormLabel>
                <FormControl>
                  <div className="relative w-full">
                    <Input
                      placeholder={t('currentPasswordPlaceholder')}
                      type={showCurrentPassword ? 'text' : 'password'}
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                    >
                      {showCurrentPassword ? (
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
            name="new_password"
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
            name="new_password_confirmation"
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
