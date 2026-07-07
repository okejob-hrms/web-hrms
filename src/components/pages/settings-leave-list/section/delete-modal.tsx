'use client';

import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogFooter,
} from '@/components/ui/alert-dialog';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

export default function LeaveBalanceDelete({
  open,
  onOpenChange,
  onDelete,
  isLoading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: () => void;
  isLoading?: boolean;
}) {
  const t = useTranslations('settings');
  const tCommon = useTranslations('common');

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="w-full max-w-md sm:max-w-md text-center bg-white">
        <div className="flex flex-col items-center justify-center mb-4">
          <span className="mb-2">
            <Image
              src={'/icons/deleteContained.svg'}
              width={50}
              height={50}
              alt="icon-delete"
            />
          </span>
          <AlertDialogTitle className="text-xl font-bold mb-2">
            {t('deleteLeaveBalanceTitle')}
          </AlertDialogTitle>
          <div className="text-gray-600 text-sm mb-4">
            {t('deleteConfigurationDesc')}
          </div>
        </div>
        <AlertDialogFooter className="flex flex-row gap-4 w-full justify-center">
          <Button
            className="w-1/2 bg-transparent text-red-500 hover:bg-transparent font-medium py-2 rounded-lg shadow-none border-none"
            onClick={onDelete}
            isLoading={isLoading}
          >
            {t('deleteConfiguration')}
          </Button>
          <Button
            className="w-1/2 bg-[#18618B] hover:bg-[#14506e] text-white font-medium py-2 rounded-lg"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            {tCommon('cancel')}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
