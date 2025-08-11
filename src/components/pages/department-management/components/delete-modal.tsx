import { AlertDialogFooter } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function DeleteDepartmentDialog({
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
      <AlertDialogContent className="w-full max-w-md sm:max-w-md text-center">
        <div className="flex flex-col items-center justify-center mb-4">
          {/* Warning Icon (SVG) */}
          <span className="mb-2">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="2" width="20" height="20" rx="6" fill="#D96C6C" />
              <path
                d="M9.17 9.17L12 12m0 0l2.83 2.83M12 12l2.83-2.83M12 12l-2.83 2.83"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <rect
                x="8"
                y="8"
                width="8"
                height="8"
                rx="4"
                fill="#fff"
                fillOpacity="0.1"
              />
              <path
                d="M9.5 9.5l5 5m0-5l-5 5"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <AlertDialogTitle className="text-xl font-bold mb-2">
            Are you sure you want to delete this department?
          </AlertDialogTitle>
          <div className="text-gray-600 text-sm mb-4">
            Deleting this department may affect any existing job position
            mappings linked to it. If mappings have been set up, you’ll need to
            reassign affected positions manually.
          </div>
        </div>
        <AlertDialogFooter className="flex flex-row gap-4 w-full justify-center">
          <Button
            className="w-1/2 bg-transparent text-red-500 hover:bg-transparent font-medium py-2 rounded-lg shadow-none border-none"
            onClick={onDelete}
          >
            Delete Department
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
