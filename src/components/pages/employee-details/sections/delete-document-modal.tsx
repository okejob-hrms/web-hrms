import React, { useState } from "react";
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
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface Props {
  onArchieve: () => void;
  disabled: boolean;
  onModalClose: () => void;
}

export default function DeleteDocumentModal({
  onArchieve,
  disabled,
  onModalClose,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const handleArchieve = async (e: React.MouseEvent) => {
    console.log("Employee data updated");
    e.preventDefault();
    e.stopPropagation();

    try {
      await onArchieve();
      setIsOpen(false);
      onModalClose();
    } catch (error) {
      console.error("Error updating employee:", error);
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(true);
  };

  return (
    <>
      <Button
        onClick={handleDeleteClick}
        className="h-fit p-0 font-normal cursor-pointer justify-start"
        variant="ghost"
        type="button"
        asChild={false}
      >
        <div className="flex items-center gap-2">
          <Image width={15} height={15} src="/icons/delete.svg" alt="Delete" />
          Delete
        </div>
      </Button>

      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6 gap-8">
          <AlertDialogHeader className="text-center items-center justify-center gap-0">
            <Image
              src="/icons/deleteContained.svg"
              height={56}
              width={56}
              alt="archieve confirmation"
              className="mb-4"
            />
            <AlertDialogTitle className="text-lg font-semibold text-black mb-2">
              Are you sure you want to delete this document?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-text-secondary text-center">
              Once deleted, this document will be permanently removed and cannot
              be restored. Please confirm before proceeding.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="flex justify-between gap-3 w-full">
            <AlertDialogAction
              onClick={handleArchieve}
              className="flex-1 bg-transparent hover:opacity-50 hover:bg-transparent font-semibold text-error rounded-md py-2"
              disabled={disabled}
            >
              Delete Document
            </AlertDialogAction>
            <AlertDialogCancel
              onClick={handleCancel}
              className="flex-1 border bg-primary text-white border-primary hover:text-white rounded-md py-2 font-semibold"
            >
              Cancel
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
