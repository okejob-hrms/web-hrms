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
}

export default function ArchieveEmployeeModal({ onArchieve, disabled }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const handleArchieve = () => {
    onArchieve();
    setIsOpen(false);
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  return (
    <div className="space-y-4">
      <Button
        onClick={() => setIsOpen(true)}
        className="md:min-w-[174px] text-error font-semibold text-base"
        variant="ghost"
        type="button"
      >
        <Image
          src="/icons/deleteOutlined.svg"
          width={20}
          height={20}
          alt="delete"
        />{" "}
        Archieve Employee
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
              Are you sure you want to archive this employee?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-text-secondary text-center">
              Archiving will remove this employee from the active employee list.
              The data is not deleted and can be restored at any time.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="flex justify-between gap-3  w-full">
            <AlertDialogAction
              onClick={handleArchieve}
              className="flex-1 bg-transparent hover:opacity-50 hover:bg-transparent font-semibold text-error rounded-md py-2"
              disabled={disabled}
            >
              Archieve Employee Data
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
    </div>
  );
}
