'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useRouter, useSearchParams } from 'next/navigation';
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
import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { postChangePassword } from '@/services/auth';
import { toast } from 'sonner';

// -----------------------------
// Zod Schema
// -----------------------------
const formSchema = z
  .object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    password_confirmation: z
      .string()
      .min(6, 'Password confirmation is required'),
    token: z.string().min(1, 'Token is required'),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Passwords do not match',
    path: ['password_confirmation'],
  });

export default function ChangePasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const emailParam = searchParams.get('email') ?? '';
  const tokenParam = searchParams.get('token') ?? '';

  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  // -----------------------------
  // Form
  // -----------------------------
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: emailParam,
      password: '',
      password_confirmation: '',
      token: tokenParam,
    },
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  // Update default values kalau email/token di URL berubah
  useEffect(() => {
    form.reset({
      email: emailParam,
      password: '',
      password_confirmation: '',
      token: tokenParam,
    });
  }, [emailParam, tokenParam, form]);

  // -----------------------------
  // Mutation
  // -----------------------------
  const mutation = useMutation({
    mutationFn: postChangePassword,
    onSuccess: () => {
      toast.success('Password successfully changed!');
      router.push('/auth/success-change-password');
    },
    onError: () => {
      const message = 'Failed to change password';
      toast.error(message);
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    mutation.mutate(values);
  };

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col justify-center px-6">
      {/* Back button */}
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm font-medium mb-6 w-fit"
      >
        <ArrowLeft className="h-5 w-5" /> Back
      </Button>

      {/* Title */}
      <h1 className="text-2xl font-bold mb-1">Create a New Password</h1>
      <p className="text-muted-foreground mb-6">
        Create a new password for this account
      </p>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Email (disabled) */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" disabled {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Hidden Token */}
          <FormField
            control={form.control}
            name="token"
            render={({ field }) => <input type="hidden" {...field} />}
          />

          {/* Password */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <div className="relative w-full">
                    <Input
                      placeholder="Input your password"
                      type={showPassword ? 'text' : 'password'}
                      className="w-full"
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Password Confirmation */}
          <FormField
            control={form.control}
            name="password_confirmation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password Confirmation</FormLabel>
                <FormControl>
                  <div className="relative w-full">
                    <Input
                      placeholder="Confirm your password"
                      type={showPasswordConfirm ? 'text' : 'password'}
                      className="w-full"
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
            {mutation.isPending ? 'Processing...' : 'Continue'}
          </Button>
        </form>
      </Form>
    </div>
  );
}
