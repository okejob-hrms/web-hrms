"use client";

import * as React from "react";
import Image from "next/image";

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

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting?: boolean;
}

export default function EssBusinessTripCancelModal({
  isOpen,
  onClose,
  onConfirm,
  isSubmitting,
}: Props) {
  const handleConfirm = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onConfirm();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
        <AlertDialogHeader className="text-center items-center justify-center">
          <Image
            src="/icons/deleteContained.svg"
            height={56}
            width={56}
            alt="cancel confirmation"
          />
          <AlertDialogTitle className="text-lg text-center font-semibold text-black mb-2">
            Cancel this business trip request?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-center text-text-secondary">
            This request will be marked as cancelled and cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="flex justify-between gap-3 w-full">
          <AlertDialogCancel
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 border text-primary border-primary bg-white hover:bg-blue-50 rounded-md py-2 font-medium"
          >
            Back
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="flex-1 bg-primary text-white rounded-md py-2 font-medium"
          >
            {isSubmitting ? "Cancelling..." : "Confirm Cancel"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
