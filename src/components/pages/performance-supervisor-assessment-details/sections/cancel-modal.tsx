import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import Image from "next/image";
import * as React from "react";

interface Props {
  id: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
}

export const CancelModal: React.FC<Props> = ({
  open,
  onOpenChange,
  onSubmit,
}) => {
  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          handleClose();
        }
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <Image
            src="/icons/confirmation.svg"
            height={56}
            width={56}
            alt="confirmation"
            className="m-auto"
          />
          <DialogTitle className="text-center font-semibold">
            Are you sure you want to cancel this supervisor assessment process?
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className="text-center text-text-secondary">
          All progress and records related to this assessment will be
          permanently removed
        </DialogDescription>
        <DialogFooter className="w-full grid grid-cols-2 gap-2">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={onSubmit} className="bg-error text-white">
            Cancel Assessment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
