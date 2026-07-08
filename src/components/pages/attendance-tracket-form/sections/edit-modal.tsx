import React, { useState } from 'react';
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
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

interface Props {
  onUpdate: () => void;
  isLoading: boolean;
}

export default function EmployeeUpdateModal({ onUpdate, isLoading }: Props) {
  const t = useTranslations('attendance');
  const tCommon = useTranslations('common');
  const [isOpen, setIsOpen] = useState(false);

  const handleUpdate = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await onUpdate();
      setIsOpen(false);
    } catch (error) {
      console.error('Error updating employee:', error);
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  return (
    <div className="space-y-4">
      <Button
        type="button"
        onClick={() => setIsOpen(true)}
        className="md:min-w-[100px]"
        isLoading={isLoading}
      >
        {tCommon('update')}
      </Button>

      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
          <AlertDialogHeader className="text-center items-center justify-center">
            <Image
              src="/icons/confirmation.svg"
              height={56}
              width={56}
              alt={tCommon('update')}
            />
            <AlertDialogTitle className="text-lg font-semibold text-black mb-2">
              {t('updateAttendanceConfirmTitle')}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-text-secondary">
              {t('confirmBeforeProceeding')}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="flex justify-between gap-3 w-full">
            <AlertDialogCancel
              onClick={handleCancel}
              className="flex-1 border text-primary border-primary bg-white hover:bg-blue-50 rounded-md py-2 font-medium"
            >
              {tCommon('cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleUpdate}
              className="flex-1 bg-primary text-white rounded-md py-2 font-medium"
            >
              {tCommon('update')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
