"use client";

import { AlertDialogFooter } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Image from "next/image";

interface DeleteHandoverDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: () => void;
  isLoading?: boolean;
}

export default function DeleteHandoverDialog({
  open,
  onOpenChange,
  onDelete,
  isLoading,
}: DeleteHandoverDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="w-full max-w-md text-center bg-white p-8">
        <div className="flex flex-col items-center justify-center">
          <div className="mb-4">
            <Image
              src="/icons/delete.svg"
              width={80}
              height={80}
              alt="delete-icon"
            />
          </div>
          <AlertDialogTitle className="text-xl font-bold mb-2">
            Are you sure you want to delete this handover item?
          </AlertDialogTitle>
          <div className="text-gray-500 text-sm mb-6">
            This action cannot be undone. This item will be permanently removed from 
            the work handover list.
          </div>
        </div>
        <AlertDialogFooter className="flex flex-row gap-3 w-full justify-center">
          <Button
            className="flex-1 bg-transparent text-red-500 hover:bg-red-50 font-semibold py-2 rounded-lg border-none shadow-none"
            onClick={onDelete}
            disabled={isLoading}
          >
            {isLoading ? "Deleting..." : "Delete Handover"}
          </Button>
          <Button
            className="flex-1 bg-[#18618B] hover:bg-[#14506e] text-white font-semibold py-2 rounded-lg"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}