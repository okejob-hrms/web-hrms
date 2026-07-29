'use client';

import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

interface Props {
  onUpdate: (e?: React.FormEvent) => void;
  isOpen: boolean;
  setIsOpen: (x: boolean) => void;
  titleKey?: 'confirmRegeneratePayrun' | 'confirmRecalculatePayslip';
  descriptionKey?:
    | 'confirmRegeneratePayrunDesc'
    | 'confirmRecalculatePayslipDesc';
}

export default function PayrunGenerateModal({
  onUpdate,
  isOpen,
  setIsOpen,
  titleKey = 'confirmRegeneratePayrun',
  descriptionKey = 'confirmRegeneratePayrunDesc',
}: Props) {
  const t = useTranslations('payroll');
  const tCommon = useTranslations('common');

  const handleUpdate = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await onUpdate();
      setIsOpen(false);
    } catch (error) {
      console.error('Error updating Payruns:', error);
    }
  };

  return (
    <div className="space-y-4">
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
          <AlertDialogHeader className="text-center items-center justify-center">
            <Image
              src="/icons/confirmation.svg"
              height={56}
              width={56}
              alt="confirmation"
            />
            <AlertDialogTitle className="text-lg text-center font-semibold text-black mb-2">
              {t(titleKey)}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-center text-text-secondary">
              {t(descriptionKey)}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="flex justify-between gap-3 w-full">
            <AlertDialogCancel
              onClick={() => setIsOpen(false)}
              className="flex-1 border text-primary border-primary bg-white hover:bg-blue-50 rounded-md py-2 font-medium"
            >
              {tCommon('cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleUpdate}
              className="flex-1 bg-primary text-white rounded-md py-2 font-medium"
            >
              {tCommon('continue')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
