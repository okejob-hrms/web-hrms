import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface DepartmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  departmentName: string;
  setDepartmentName: (name: string) => void;
  description: string;
  setDescription: (desc: string) => void;
  editIndex: number | null;
  handleSave: () => void;
  handleClose: () => void;
}

export default function DepartmentModal({
  open,
  onOpenChange,
  departmentName,
  setDepartmentName,
  description,
  setDescription,
  editIndex,
  handleSave,
  handleClose,
}: DepartmentModalProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="w-full max-w-md sm:max-w-xl bg-white">
        <AlertDialogHeader>
          <AlertDialogTitle>
            {editIndex !== null
              ? "Edit Department Details"
              : "Create New Department"}
          </AlertDialogTitle>
        </AlertDialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
          className="flex flex-col gap-4 mt-4"
        >
          <div>
            <label className="block mb-1 normal">
              Department Name<span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              value={departmentName}
              onChange={(e) => setDepartmentName(e.target.value)}
              required
              placeholder="Enter department name"
            />
          </div>
          <div>
            <label className="block mb-1">
              Description <span className="text-gray-400">(optional)</span>
            </label>
            <Textarea
              className="resize-none h-[135px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              placeholder="Enter description"
            />
          </div>
          <AlertDialogFooter className="flex flex-row gap-4">
            <AlertDialogCancel
              className="w-1/3 border-2 border-[#18618B] text-[#18618B] bg-white hover:bg-[#e6f1f7] font-medium py-2 rounded-lg"
              onClick={handleClose}
            >
              Cancel
            </AlertDialogCancel>
            <Button
              type="submit"
              className="w-1/3 bg-[#18618B] hover:bg-[#14506e] text-white font-medium py-2 rounded-lg"
              disabled={!departmentName}
            >
              Save
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
