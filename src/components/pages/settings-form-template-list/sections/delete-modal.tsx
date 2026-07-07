'use client';

import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Image from "next/image";
import { useTranslations } from "next-intl";

interface Props {
  onDelete: (e?: React.FormEvent) => void;
  isOpen: boolean;
  setIsOpen: (x: boolean) => void;
}

export default function FormDeleteModal({
  onDelete,
  isOpen,
  setIsOpen,
}: Props) {
  const t = useTranslations('settings');
  const tCommon = useTranslations('common');

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await onDelete();
      setIsOpen(false);
    } catch (error) {
      console.error("Error deleting form:", error);
    }
  };

  return (
    <div className="space-y-4">
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
          <AlertDialogHeader className="text-center items-center justify-center">
            <Image
              src="/icons/deleteContained.svg"
              height={56}
              width={56}
              alt="confirmation"
            />
            <AlertDialogTitle className="text-lg text-center font-semibold text-black mb-2">
              {t('confirmDeleteForm')}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-center text-text-secondary">
              {t('actionCannotBeUndone')}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="flex justify-between gap-3 w-full">
            <AlertDialogAction
              onClick={handleDelete}
              className="flex-1 bg-transparent text-red-500 rounded-md py-2 font-medium hover:bg-red-50"
            >
              {t('deleteFormAction')}
            </AlertDialogAction>
            <AlertDialogCancel
              onClick={() => setIsOpen(false)}
              className="flex-1 border bg-primary text-white rounded-md py-2 font-medium"
            >
              {tCommon('cancel')}
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
