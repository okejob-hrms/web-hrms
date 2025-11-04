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

interface Props {
  onConfirm: () => Promise<void> | void;
  isOpen: boolean;
  setIsOpen: (x: boolean) => void;
  isLoading?: boolean;
}

export default function ConfirmModal({
  onConfirm,
  isOpen,
  setIsOpen,
  isLoading = false,
}: Props) {
  const handleConfirm = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await onConfirm();
    } catch (error) {
      console.error("Error creating form:", error);
    }
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(false);
  };

  return (
    <div className="space-y-4">
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent
          className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              e.stopPropagation();
            }
          }}
        >
          <AlertDialogHeader className="text-center items-center justify-center">
            <Image
              src="/icons/confirmation.svg"
              height={56}
              width={56}
              alt="confirmation"
            />
            <AlertDialogTitle className="text-lg text-center font-semibold text-black mb-2">
              Are you sure you want to create this form?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-center text-text-secondary">
              Please make sure all information is accurate before proceeding.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="flex justify-between gap-3 w-full">
            <AlertDialogCancel
              onClick={handleCancel}
              disabled={isLoading}
              className="flex-1 border bg-transparent text-primary rounded-md py-2 font-medium"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              disabled={isLoading}
              className="flex-1 text-white bg-primary rounded-md py-2 font-medium hover:bg-red-50"
            >
              {isLoading ? "Creating..." : "Create Form"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
