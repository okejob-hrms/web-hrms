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
import { Textarea } from "@/components/ui/textarea";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onReject: (note?: string | null) => void;
  isSubmitting?: boolean;
}

export default function BusinessTripRejectModal({
  isOpen,
  onClose,
  onReject,
  isSubmitting,
}: Props) {
  const [note, setNote] = React.useState("");

  React.useEffect(() => {
    if (!isOpen) setNote("");
  }, [isOpen]);

  const handleReject = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onReject(note.trim() ? note.trim() : null);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
        <AlertDialogHeader className="text-center items-center justify-center">
          <Image
            src="/icons/deleteContained.svg"
            height={56}
            width={56}
            alt="reject confirmation"
          />
          <AlertDialogTitle className="text-lg text-center font-semibold text-black mb-2">
            Are you sure you want to reject this business trip?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-center text-text-secondary">
            This business trip will be marked as rejected.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex flex-col gap-2">
          <label className="text-sm text-text-secondary">
            Note <span className="text-text-disabled">(optional)</span>
          </label>
          <Textarea
            placeholder="Add a note for this rejection (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
          />
        </div>

        <AlertDialogFooter className="flex justify-between gap-3 w-full">
          <AlertDialogCancel
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 border text-primary border-primary bg-white hover:bg-blue-50 rounded-md py-2 font-medium"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleReject}
            disabled={isSubmitting}
            className="flex-1 bg-primary text-white rounded-md py-2 font-medium"
          >
            {isSubmitting ? "Rejecting..." : "Reject"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
