'use client';

import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { postLogin } from '@/services/auth';
import { toast } from 'sonner';
import Image from 'next/image';
import { LanguageSwitch } from '@/components/shared/language-switch';
import { createLoginSchema } from '@/lib/validation/schemas';
import { translateApiMessage } from '@/lib/i18n/api-messages';
import { useState } from 'react';

export default function AuthLogin() {
  const router = useRouter();
  const t = useTranslations('auth');
  const tValidation = useTranslations('validation');
  const tToast = useTranslations('toast');
  const tApi = useTranslations('api');
  const [showPassword, setShowPassword] = useState(false);

  const loginSchema = useMemo(() => createLoginSchema(tValidation), [tValidation]);

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: { email: string; password: string }) => {
    try {
      const res = await postLogin(values);

      if (res.status === 'success') {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        localStorage.setItem('user_role', JSON.stringify(res.data.roles));

        if (res.data.user.is_first_login) {
          toast.success(tToast('loginFirstTime'));
          router.push('/auth/change-password');
        } else {
          const roles = res.data.roles || [];
          const isEmployee = roles.some((role) =>
            role.toLowerCase().includes('employee'),
          );

          if (isEmployee) {
            router.push('/ess');
          } else {
            router.push('/dashboard?overview=offboarding-active');
          }

          toast.success(tToast('loginSuccess'));
        }
      } else {
        const message = res.message || tToast('loginFailed');
        toast.error(translateApiMessage(message, tApi));
      }
    } catch (err) {
      console.log(err);
      toast.error(tToast('serverError'));
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-r from-blue-50 to-white">
      <div className="absolute right-4 top-4">
        <LanguageSwitch showOnMobile />
      </div>
      <Card className="w-full max-w-md">
        <CardHeader className="flex justify-center">
          <Image src="/logo.png" alt="logo" width={80} height={80} />
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="flex flex-col w-full">
                    <FormLabel className="mb-1">{t('email')}</FormLabel>
                    <FormControl>
                      <div className="relative w-full">
                        <Input
                          placeholder={t('emailPlaceholder')}
                          type="email"
                          className="w-full"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="flex flex-col w-full">
                    <FormLabel className="mb-1">{t('password')}</FormLabel>
                    <FormControl>
                      <div className="relative w-full">
                        <Input
                          placeholder={t('passwordPlaceholder')}
                          type={showPassword ? 'text' : 'password'}
                          className="absolute w-full"
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

              <div className="text-right">
                <a
                  href="/auth/reset-password"
                  className="text-sm text-blue-600 hover:underline"
                >
                  {t('resetPassword')}
                </a>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? t('signingIn') : t('signIn')}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
