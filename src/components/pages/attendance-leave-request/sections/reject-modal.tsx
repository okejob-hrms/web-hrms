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
  onReject: () => void;
}

export default function LeaveRejectModal({ isOpen, onClose, onReject }: Props) {
  const t = useTranslations('attendance');
  const tCommon = useTranslations('common');

  const handleReject = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await onReject();
    } catch (error) {
      console.error('Error rejecting leave:', error);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
        <AlertDialogHeader className="text-center items-center justify-center">
          <Image
            src="/icons/deleteContained.svg"
            height={56}
            width={56}
            alt="confirmation"
          />
          <AlertDialogTitle className="text-lg text-center font-semibold text-black mb-2">
            {t('confirmRejectLeave')}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-center text-text-secondary">
            {t('rejectLeaveDesc')}
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
            onClick={handleReject}
            className="flex-1 bg-primary text-white rounded-md py-2 font-medium"
          >
            {tCommon('reject')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
