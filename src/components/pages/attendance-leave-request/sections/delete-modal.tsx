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
  onDelete: () => void;
}

export default function LeaveDeleteModal({ isOpen, onClose, onDelete }: Props) {
  const t = useTranslations('attendance');
  const tCommon = useTranslations('common');

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await onDelete();
    } catch (error) {
      console.error('Error deleting leave:', error);
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
            {t('confirmDeleteLeave')}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-center text-text-secondary">
            {t('deleteLeaveDesc')}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="flex justify-between gap-3 w-full">
          <AlertDialogAction
            onClick={handleDelete}
            className="flex-1 bg-transparent text-red-500 rounded-md py-2 font-medium hover:bg-red-50"
          >
            {tCommon('delete')}
          </AlertDialogAction>
          <AlertDialogCancel
            onClick={onClose}
            className="flex-1 border bg-primary text-white rounded-md py-2 font-medium"
          >
            {tCommon('cancel')}
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
