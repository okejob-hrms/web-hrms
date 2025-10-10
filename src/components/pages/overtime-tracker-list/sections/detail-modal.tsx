import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { stringAvatar } from '@/lib/utils';
import dayjs from 'dayjs';
import { OvertimeListItem } from '@/services/overtime/types';

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
  const handleUpdate = async (e: React.MouseEvent) => {
    console.log('Employee data updated');
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
    console.log('Employee data updated');
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
              Overtime Request Details
            </AlertDialogTitle>
          </AlertDialogHeader>
          <div className="flex flex-col items-center justify-center">
            <Avatar className="h-18 w-18">
              <AvatarImage src={`${data?.employee?.avatar_url}`} />
              <AvatarFallback className="text-primary-hover bg-primary-background text-base font-medium">
                {stringAvatar(data?.employee?.name ?? '')}
              </AvatarFallback>
            </Avatar>
            <div className="flex gap-3">
              <div className="font-medium">{data?.employee?.name}</div>
              <div className="font-medium text-gray-600">
                (#{data?.employee?.id})
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 space-y-2 mb-4">
            <div>
              <div className="text-sm text-gray-500">Overtime Date</div>
              <div>{dayjs(data?.overtime_date).format('MMMM D, YYYY')}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Request On</div>
              <div>{dayjs(data?.request_date).format('MMMM D, YYYY')}</div>
            </div>
            <div className="col-span-2">
              <div className="text-sm text-gray-500">Duration</div>
              <div>
                {data?.duration}m | {data?.start_time} - {data?.end_time}
              </div>
            </div>
            <div className="col-span-2">
              <div className="text-sm text-gray-500">Notes</div>
              <div>{data?.notes}</div>
            </div>
          </div>
          <AlertDialogFooter className="flex justify-between gap-3 w-full">
            <AlertDialogCancel
              onClick={() => setIsOpen(false)}
              className="flex-1 border text-primary border-primary bg-white hover:bg-blue-50 rounded-md py-2 font-medium"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogCancel
              onClick={handleReject}
              className="flex-1 bg-white text-red-500 rounded-md py-2 font-medium border-red-500"
            >
              Reject
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleUpdate}
              className="flex-1 bg-primary text-white rounded-md py-2 font-medium"
            >
              Approve
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
