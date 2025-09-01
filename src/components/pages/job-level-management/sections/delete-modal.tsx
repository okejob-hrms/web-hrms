import { AlertDialogFooter } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Image from "next/image";

export default function DeleteJobLevelDialog({
  open,
  onOpenChange,
  onDelete,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: () => void;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="w-full max-w-md sm:max-w-md text-center bg-white">
        <div className="flex flex-col items-center justify-center mb-4">
          {/* Warning Icon (SVG) */}
          <span className="mb-2">
            <Image
              src={"/icons/delete.svg"}
              width={50}
              height={50}
              alt={`icon-delete`}
            />
          </span>
          <AlertDialogTitle className="text-xl font-bold mb-2">
            Are you sure you want to delete this job level?
          </AlertDialogTitle>
          <div className="text-gray-600 text-sm mb-4">
            Deleting this job level may affect any existing job position
            mappings linked to it. If mappings have been set up, you’ll need to
            reassign affected positions manually.
          </div>
        </div>
        <AlertDialogFooter className="flex flex-row gap-4 w-full justify-center">
          <Button
            className="w-1/2 bg-transparent text-red-500 hover:bg-transparent font-medium py-2 rounded-lg shadow-none border-none"
            onClick={onDelete}
          >
            Delete Job Level
          </Button>
          <Button
            className="w-1/2 bg-[#18618B] hover:bg-[#14506e] text-white font-medium py-2 rounded-lg"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
