import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { DepartmentFormValues, departmentManagementFormScheme } from "../types";

interface DepartmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editIndex: number | null;
  handleSave: (data: DepartmentFormValues) => void;
  handleClose: () => void;
}

export default function DepartmentModal({
  open,
  onOpenChange,
  editIndex,
  handleSave,
  handleClose,
}: DepartmentModalProps) {
  const form = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentManagementFormScheme),
    mode: "onChange", // validate on change so Save button can disable live
    defaultValues: {
      departmentName: "",
      description: "",
    },
  });

  const onSubmit = (data: DepartmentFormValues) => {
    handleSave(data);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="w-full max-w-md sm:max-w-xl bg-white px-4">
        <AlertDialogHeader>
          <AlertDialogTitle>
            {editIndex !== null
              ? "Edit Department Details"
              : "Create New Department"}
          </AlertDialogTitle>
        </AlertDialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4 mt-4"
          >
            {/* Department Name */}
            <FormField
              control={form.control}
              name="departmentName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Department Name <span className="text-red-500">*</span>
                  </FormLabel>
                  <Input placeholder="Enter department name" {...field} />
                  <FormMessage /> {/* shows inline error */}
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Description{" "}
                    <span className="text-gray-400">(optional)</span>
                  </FormLabel>
                  <Textarea
                    className="resize-none h-[135px] whitespace-pre-wrap break-all"
                    rows={5}
                    placeholder="Enter description"
                    {...field}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <AlertDialogFooter className="flex justify-center gap-4">
              <AlertDialogCancel
                className="min-w-[100px] border-2 border-[#18618B] text-[#18618B] bg-white hover:bg-[#e6f1f7] font-medium py-2 rounded-lg"
                onClick={handleClose}
              >
                Cancel
              </AlertDialogCancel>
              <Button
                type="submit"
                disabled={!form.formState.isValid}
                className="min-w-[100px] bg-[#18618B] hover:bg-[#14506e] text-white font-medium py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save
              </Button>
            </AlertDialogFooter>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
