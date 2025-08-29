'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import { postRequestReset } from '@/services/auth'; // sesuaikan path
import { toast } from 'sonner';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');

  // useMutation untuk handle submit
  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      return postRequestReset({ email }); // payload
    },
    onSuccess: () => {
      toast.success('Success send mail');
      router.push('/auth/mail-confirm');
    },
    onError: () => {
      toast.error(`Failed send mail: The selected email is invalid`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate();
  };

  const isEmailValid = email.trim() !== '' && /\S+@\S+\.\S+/.test(email);

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col justify-center px-6">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm font-medium mb-6"
      >
        <ArrowLeft className="h-5 w-5" /> Back
      </button>

      {/* Title */}
      <h1 className="text-2xl font-bold mb-1">Reset Password</h1>
      <p className="text-muted-foreground mb-6">
        Enter your registered email to reset password
      </p>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Input
              id="email"
              type="email"
              placeholder="Input your registered email"
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
          {isPending ? 'Processing...' : 'Continue'}
        </Button>
      </form>
    </div>
  );
}
