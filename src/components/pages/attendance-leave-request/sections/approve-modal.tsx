import React from 'react';
import { useTranslations } from 'next-intl';
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

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onApprove: () => void;
}

export default function LeaveApproveModal({
  isOpen,
  onClose,
  onApprove,
}: Props) {
  const t = useTranslations('attendance');
  const tCommon = useTranslations('common');

  const handleApprove = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await onApprove();
    } catch (error) {
      console.error('Error approving leave:', error);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
        <AlertDialogHeader className="text-center items-center justify-center">
          <Image
            src="/icons/confirmation.svg"
            height={56}
            width={56}
            alt="confirmation"
          />
          <AlertDialogTitle className="text-lg text-center font-semibold text-black mb-2">
            {t('confirmApproveLeave')}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-center text-text-secondary">
            {t('confirmBeforeProceeding')}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="flex justify-between gap-3 w-full">
          <AlertDialogCancel
            onClick={onClose}
            className="flex-1 border text-primary border-primary bg-white hover:bg-blue-50 rounded-md py-2 font-medium"
          >
            {tCommon('cancel')}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleApprove}
            className="flex-1 bg-primary text-white rounded-md py-2 font-medium"
          >
            {tCommon('approve')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
