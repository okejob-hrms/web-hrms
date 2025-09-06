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

export default function EmployeeArchieveModal({ onArchieve, disabled }: Props) {
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
        <AlertDialogContent className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
          <AlertDialogHeader className="text-center items-center justify-center">
            <Image
              src="/icons/delete.svg"
              height={56}
              width={56}
              alt="archieve confirmation"
            />
            <AlertDialogTitle className="text-lg font-semibold text-black mb-2">
              Are you sure want to update this employee data?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-text-secondary">
              Please make sure all information is accurate before proceeding.
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
