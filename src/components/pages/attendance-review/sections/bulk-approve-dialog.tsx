'use client';

import * as React from 'react';
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

interface BulkApproveDialogProps {
  open: boolean;
  approvable: number;
  blockersOpen: number;
  warningsOpen: number;
  isPending: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function BulkApproveDialog({
  open,
  approvable,
  blockersOpen,
  warningsOpen,
  isPending,
  onOpenChange,
  onConfirm,
}: BulkApproveDialogProps) {
  const t = useTranslations('attendanceReview');
  const tCommon = useTranslations('common');

  return (
    <AlertDialog open={open} onOpenChange={(next) => !isPending && onOpenChange(next)}>
      <AlertDialogContent className="max-w-md bg-white">
        <AlertDialogHeader>
          <AlertDialogTitle>{t('bulkApproveTitle', { count: approvable })}</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="flex flex-col gap-2 text-sm text-text-secondary">
              <p>{t('bulkApproveBlockers', { count: blockersOpen })}</p>
              {warningsOpen > 0 ? <p>{t('bulkApproveWarnings', { count: warningsOpen })}</p> : null}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>{tCommon('cancel')}</AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending || approvable === 0}
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
          >
            {isPending ? tCommon('processing') : t('approveClean', { count: approvable })}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
