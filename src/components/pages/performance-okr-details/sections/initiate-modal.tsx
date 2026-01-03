import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import Image from "next/image";
import * as React from "react";

interface IInitiateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (id: number) => void;
  id: number;
}

export const InitiateModal: React.FC<IInitiateModalProps> = ({
  open,
  onOpenChange,
  onSubmit,
  id,
}) => {
  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          onOpenChange(false);
        }
      }}
    >
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto p-2 bg-white">
        <DialogHeader className="px-6 pt-6 pb-4">
          <Image
            src="/icons/confirmation.svg"
            height={56}
            width={56}
            alt="confirmation"
            className="m-auto"
          />
          <DialogTitle className="text-xl font-semibold text-center">
            Are you sure you want to initiate this OKR?
          </DialogTitle>
        </DialogHeader>
        <DialogFooter className="px-6 pb-6 w-full grid grid-cols-1 md:grid-cols-2 gap-2">
          <Button className="font-semibold" onClick={() => onSubmit(id)}>
            Initiate OKR
          </Button>
          <Button
            variant="outline"
            className="font-semibold"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
