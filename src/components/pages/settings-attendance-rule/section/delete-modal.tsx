'use client';

import Image from 'next/image';

import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogFooter,
} from '@/components/ui/alert-dialog';

interface AttendanceRuleDeleteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: () => void;
  isLoading?: boolean;
  ruleName?: string;
}

export default function AttendanceRuleDelete({
  open,
  onOpenChange,
  onDelete,
  isLoading,
  ruleName,
}: AttendanceRuleDeleteProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="w-full max-w-md sm:max-w-md text-center bg-white">
        <div className="flex flex-col items-center justify-center mb-4">
          <span className="mb-2">
            <Image
              src="/icons/delete.svg"
              width={50}
              height={50}
              alt="icon-delete"
            />
          </span>
          <AlertDialogTitle className="text-xl font-bold mb-2">
            Hapus aturan kehadiran?
          </AlertDialogTitle>
          <div className="text-gray-600 text-sm mb-4">
            {ruleName ? (
              <>
                Aturan <span className="font-semibold">{ruleName}</span> akan
                dihapus permanen. Karyawan terkait mungkin terdampak.
              </>
            ) : (
              'Aturan akan dihapus permanen. Karyawan terkait mungkin terdampak.'
            )}
          </div>
        </div>
        <AlertDialogFooter className="flex flex-row gap-4 w-full justify-center">
          <Button
            className="w-1/2 bg-transparent text-red-500 hover:bg-transparent font-medium py-2 rounded-lg shadow-none border-none"
            onClick={onDelete}
            isLoading={isLoading}
          >
            Hapus
          </Button>
          <Button
            className="w-1/2 bg-[#18618B] hover:bg-[#14506e] text-white font-medium py-2 rounded-lg"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Batal
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
