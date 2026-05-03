"use client";

import * as React from "react";
import { CheckCircle2 } from "lucide-react";

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
  onApprove: (note?: string | null) => void;
  isSubmitting?: boolean;
}

export default function BusinessTripApproveModal({
  isOpen,
  onClose,
  onApprove,
  isSubmitting,
}: Props) {
  const [note, setNote] = React.useState("");

  React.useEffect(() => {
    if (!isOpen) setNote("");
  }, [isOpen]);

  const handleApprove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onApprove(note.trim() ? note.trim() : null);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
        <AlertDialogHeader className="text-center items-center justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <AlertDialogTitle className="text-lg text-center font-semibold text-black mb-2">
            Are you sure you want to approve this business trip?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-center text-text-secondary">
            This business trip will be marked as approved.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex flex-col gap-2">
          <label className="text-sm text-text-secondary">
            Note <span className="text-text-disabled">(optional)</span>
          </label>
          <Textarea
            placeholder="Add a note for this approval (optional)"
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
            onClick={handleApprove}
            disabled={isSubmitting}
            className="flex-1 bg-primary text-white rounded-md py-2 font-medium"
          >
            {isSubmitting ? "Approving..." : "Approve"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
