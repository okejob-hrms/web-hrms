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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { stringAvatar } from '@/lib/utils';
import { getPublicFileUrl } from '@/lib/helpers';
import { OvertimeListItem } from '@/services/overtime/types';
import { useLocale, useTranslations } from 'next-intl';
import { formatDate } from '@/lib/formatting';
import { resolveLocale } from '@/lib/i18n/locale';

interface Props {
  onUpdate: (e?: React.FormEvent) => void;
  onReject: (e?: React.FormEvent) => void;
  isOpen: boolean;
  setIsOpen: (x: boolean) => void;
  data: OvertimeListItem | undefined;
}

export default function OvertimeDetailModal({
  onUpdate,
  isOpen,
  setIsOpen,
  onReject,
  data,
}: Props) {
  const t = useTranslations('attendance');
  const tCommon = useTranslations('common');
  const tPayroll = useTranslations('payroll');
  const locale = resolveLocale(useLocale());
  const avatarSrc = getPublicFileUrl(
    data?.employee?.avatar_url ?? data?.employee?.profile?.photo_profile,
  );

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

  const handleReject = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await onReject();
      setIsOpen(false);
    } catch (error) {
      console.error('Error updating employee:', error);
    }
  };

  return (
    <div className="space-y-4">
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
          <AlertDialogHeader className="text-center items-center justify-center">
            <AlertDialogTitle className="text-lg text-center font-semibold text-black mb-2">
              {t('overtimeDetails')}
            </AlertDialogTitle>
            <AlertDialogDescription></AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex flex-col items-center justify-center">
            <Avatar className="h-18 w-18">
              {avatarSrc ? <AvatarImage src={avatarSrc} /> : null}
              <AvatarFallback className="text-primary-hover bg-primary-background text-base font-medium">
                {stringAvatar(data?.employee?.name ?? '')}
              </AvatarFallback>
            </Avatar>
            <div className="flex gap-3">
              <div className="font-medium">{data?.employee?.name}</div>
              <div className="font-medium text-gray-600">
                ({data?.employee?.profile?.code || '-'})
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 space-y-2 mb-4">
            <div>
              <div className="text-sm text-gray-500">{t('overtimeDate')}</div>
              <div>
                {data?.overtime_date
                  ? formatDate(data.overtime_date, locale)
                  : '-'}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">{tPayroll('requestOn')}</div>
              <div>
                {data?.request_date
                  ? formatDate(data.request_date, locale)
                  : '-'}
              </div>
            </div>
            <div className="col-span-2">
              <div className="text-sm text-gray-500">{t('durationLabel')}</div>
              <div>
                {data?.duration}m | {data?.start_time} - {data?.end_time}
              </div>
            </div>
            <div className="col-span-2">
              <div className="text-sm text-gray-500">{tCommon('notes')}</div>
              <div>{data?.notes}</div>
            </div>
          </div>
          <AlertDialogFooter className="flex justify-between gap-3 w-full">
            <AlertDialogCancel
              onClick={() => setIsOpen(false)}
              className="flex-1 border text-primary border-primary bg-white hover:bg-blue-50 rounded-md py-2 font-medium"
            >
              {tCommon('cancel')}
            </AlertDialogCancel>
            <AlertDialogCancel
              onClick={handleReject}
              className="flex-1 bg-white text-red-500 rounded-md py-2 font-medium border-red-500"
            >
              {tCommon('reject')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleUpdate}
              className="flex-1 bg-primary text-white rounded-md py-2 font-medium"
            >
              {tCommon('approve')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
