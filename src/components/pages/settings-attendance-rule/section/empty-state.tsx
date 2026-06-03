'use client';

import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  onCreate: () => void;
}

export default function AttendanceRuleEmptyState({ onCreate }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6 gap-4">
      <div className="w-20 h-20 rounded-full bg-primary-focused/30 flex items-center justify-center">
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-primary"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
          <path d="M9 14l2 2 4-4" />
        </svg>
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-foreground">
          Belum ada aturan kehadiran
        </h3>
        <p className="text-sm text-text-secondary max-w-md">
          Atur potongan penalty untuk keterlambatan atau pulang cepat agar
          payroll otomatis menyesuaikan tiap bulan.
        </p>
      </div>
      <Button onClick={onCreate} className="flex flex-row items-center gap-2">
        <Plus className="w-4 h-4" />
        Buat aturan pertama
      </Button>
    </div>
  );
}
