/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface Props {
  onUpdate: (e?: React.FormEvent) => void;
  disabled: boolean;
}

export const SalaryAdjustmentModal = React.memo(function SalaryAdjustmentModal({
  onUpdate,
  disabled,
}: Props) {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleUpdate = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await onUpdate();
      setIsOpen(false);
    } catch (error) {
      console.error("Error updating employee:", error);
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
  };
  return (
    <div className="space-y-4">
      <Button
        type="button"
        onClick={() => setIsOpen(true)}
        className="md:min-w-[174px]"
        disabled={disabled}
      >
        Update
      </Button>
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader className="items-center">
            <Image
              src="/icons/confirmation.svg"
              width={56}
              height={56}
              alt="complete offboarding"
            />
            <AlertDialogTitle className="text-center">
              Are you sure you want to update this salary adjustment?
            </AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter className="w-full grid grid-cols-2">
            <AlertDialogCancel onClick={handleCancel}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="text-white"
              onClick={handleUpdate}
              disabled={disabled}
            >
              Submit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
});
