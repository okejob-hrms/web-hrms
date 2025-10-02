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

interface Props {
  onUpdate: (e?: React.FormEvent) => void;
  isOpen: boolean;
  setIsOpen: (x: boolean) => void;
}

export default function AttendanceApproveModal({
  onUpdate,
  isOpen,
  setIsOpen,
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

  return (
    <div className="space-y-4">
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
          <AlertDialogHeader className="text-center items-center justify-center">
            <Image
              src="/icons/confirmation.svg"
              height={56}
              width={56}
              alt="confirmation"
            />
            <AlertDialogTitle className="text-lg text-center font-semibold text-black mb-2">
              Are you sure you want to approve this attendance record?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-center text-text-secondary">
              Make sure all the details are correct before proceeding.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="flex justify-between gap-3 w-full">
            <AlertDialogCancel
              onClick={() => setIsOpen(false)}
              className="flex-1 border text-primary border-primary bg-white hover:bg-blue-50 rounded-md py-2 font-medium"
            >
              Cancel
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
