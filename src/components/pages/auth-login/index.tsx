'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
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

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function AuthLogin() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      const res = await postLogin(values);

      if (res.status === 'success') {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        localStorage.setItem('user_role', JSON.stringify(res.data.roles));

        if (res.data.user.is_first_login) {
          toast.success('Login successful. This is your first login.');
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

          toast.success('Login successful!');
        }
      } else {
        toast.error(res.message || 'Login failed, please try again.');
      }
    } catch (err) {
      console.log(err);
      toast.error('Server error. Please try again later.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-r from-blue-50 to-white">
      <Card className="w-full max-w-md">
        <CardHeader className="flex justify-center">
          <Image src="/logo.png" alt="logo" width={80} height={80} />
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="flex flex-col w-full">
                    <FormLabel className="mb-1">Email</FormLabel>
                    <FormControl>
                      <div className="relative w-full">
                        {/* <Mail
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                          size={18}
                        /> */}
                        <Input
                          placeholder="john@gmail.com"
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

              {/* Password */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="flex flex-col w-full">
                    <FormLabel className="mb-1">Password</FormLabel>
                    <FormControl>
                      <div className="relative w-full">
                        {/* <KeyRound
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                          size={18}
                        /> */}
                        <Input
                          placeholder="Input your password"
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

              {/* Reset Password */}
              <div className="text-right">
                <a
                  href="/auth/reset-password"
                  className="text-sm text-blue-600 hover:underline"
                >
                  Reset Password
                </a>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
