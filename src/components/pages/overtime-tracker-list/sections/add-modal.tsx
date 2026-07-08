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
import dayjs from 'dayjs';
import { RequestOvertime } from '@/services/overtime/types';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useTranslations } from 'next-intl';

interface Props {
  onUpdate: (e?: React.FormEvent) => void;
  isOpen: boolean;
  setIsOpen: (x: boolean) => void;
  formData: RequestOvertime;
  setFormData: React.Dispatch<React.SetStateAction<RequestOvertime>>;
}

export default function OvertimeAddModal({
  onUpdate,
  isOpen,
  setIsOpen,
  formData,
  setFormData,
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
            <AlertDialogTitle className="text-lg text-center font-semibold text-black mb-2">
              {t('newOvertimeRequest')}
            </AlertDialogTitle>
            <AlertDialogDescription></AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid grid-cols-3 gap-3 space-y-2 mb-4">
            <div className="col-span-2">
              <div className="text-sm text-gray-500">{t('overtimeDate')}</div>
              <Input
                type="date"
                value={formData.overtime_date}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    overtime_date: e
                      ? dayjs(e.target.value).format('YYYY-MM-DD')
                      : '',
                  }));
                }}
              />
            </div>
            <div></div>
            <div className="col-span-1">
              <div className="text-sm text-gray-500">{t('startTime')}</div>
              <Input
                type="time"
                value={formData.start_time}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    start_time: e.target.value,
                  }));
                }}
              />
            </div>
            <div className="col-span-1">
              <div className="text-sm text-gray-500">{t('endTime')}</div>
              <Input
                type="time"
                value={formData.end_time}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    end_time: e.target.value,
                  }));
                }}
              />
            </div>
            <div className="col-span-3">
              <div className="text-sm text-gray-500">{tCommon('notes')}</div>
              <Textarea
                rows={5}
                value={formData.notes}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    notes: e.target.value,
                  }));
                }}
              />
            </div>
          </div>
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
              {tCommon('save')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
