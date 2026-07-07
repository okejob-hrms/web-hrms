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
}

export default function OvertimeDeleteModal({
  onUpdate,
  isOpen,
  setIsOpen,
}: Props) {
  const t = useTranslations('attendance');
  const tCommon = useTranslations('common');

  const handleUpdate = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await onUpdate();
    } catch (error) {
      console.error('Error updating employee:', error);
    }
  };

  return (
    <div className="space-y-4">
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
          <AlertDialogHeader className="text-center items-center justify-center">
            <Image
              src="/icons/deleteContained.svg"
              height={56}
              width={56}
              alt="confirmation"
            />
            <AlertDialogTitle className="text-lg text-center font-semibold text-black mb-2">
              {t('confirmDeleteOvertime')}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-center text-text-secondary">
              {t('deleteOvertimeDesc')}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="flex justify-between gap-3 w-full">
            <AlertDialogAction
              onClick={handleUpdate}
              className="flex-1 bg-transparent text-red-500 rounded-md py-2 font-medium hover:bg-red-50"
            >
              {tCommon('delete')}
            </AlertDialogAction>
            <AlertDialogCancel
              onClick={() => setIsOpen(false)}
              className="flex-1 border bg-primary text-white rounded-md py-2 font-medium"
            >
              {tCommon('cancel')}
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
