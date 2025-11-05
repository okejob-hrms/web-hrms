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
  isOpen: boolean;
  onClose: () => void;
  onApprove: () => void;
}

export default function LeaveApproveModal({
  isOpen,
  onClose,
  onApprove,
}: Props) {
  const handleApprove = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await onApprove();
    } catch (error) {
      console.error("Error approving leave:", error);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
        <AlertDialogHeader className="text-center items-center justify-center">
          <Image
            src="/icons/confirmation.svg"
            height={56}
            width={56}
            alt="confirmation"
          />
          <AlertDialogTitle className="text-lg text-center font-semibold text-black mb-2">
            Are you sure you want to approve this leave request?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-center text-text-secondary">
            Make sure all the details are correct before proceeding.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="flex justify-between gap-3 w-full">
          <AlertDialogCancel
            onClick={onClose}
            className="flex-1 border text-primary border-primary bg-white hover:bg-blue-50 rounded-md py-2 font-medium"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleApprove}
            className="flex-1 bg-primary text-white rounded-md py-2 font-medium"
          >
            Approve
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
