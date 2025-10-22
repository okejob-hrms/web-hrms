import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";

export default function DeleteDialog({
  open,
  onOpenChange,
  onDelete,
  isLoading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: () => void;
  isLoading?: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-md sm:max-w-md text-center bg-white">
        <div className="flex flex-col items-center justify-center mb-4">
          <span className="mb-2">
            <Image
              src={"/icons/deleteContained.svg"}
              width={50}
              height={50}
              alt={`icon-delete`}
            />
          </span>
          <DialogTitle className="text-xl font-bold mb-2">
            Are you sure you want to delete company?
          </DialogTitle>
          This action cannot be undone and the company information will be
          permanently removed from the system.
        </div>
        <DialogFooter className="flex flex-row gap-4 w-full justify-center">
          <Button
            className="w-1/2 bg-transparent text-red-500 hover:bg-transparent font-medium py-2 rounded-lg shadow-none border-none"
            onClick={onDelete}
            disabled={isLoading}
            type="button"
          >
            {isLoading ? "Deleting..." : "Delete Company"}
          </Button>
          <Button
            className="w-1/2 bg-[#18618B] hover:bg-[#14506e] text-white font-medium py-2 rounded-lg"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            type="button"
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
