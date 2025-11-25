import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { InputForm } from "@/components/ui/input";
import { TextAreaForm } from "@/components/ui/textarea";
import { Form } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { IMutatePerformanceCompetencyLevel } from "@/services/performance-competency/types";

interface CompetencyModalFormProps {
  open: boolean;
  onOpenChange: () => void;
  form: UseFormReturn<IMutatePerformanceCompetencyLevel>;
  handleSave: (e?: React.BaseSyntheticEvent) => Promise<void>;
  isSubmitting: boolean;
  isEditing: boolean;
}

export const CompetencyModalForm: React.FC<CompetencyModalFormProps> = ({
  open,
  onOpenChange,
  form,
  handleSave,
  isSubmitting,
  isEditing,
}) => {
  const handleClose = (): void => {
    onOpenChange();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 bg-white">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-xl font-semibold">
            {isEditing ? "Edit" : "Add"} Competency Level
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSave} className="px-6 pb-6 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <InputForm name="dimensions" label="Dimensions" required />
              </div>

              <div className="space-y-2">
                <InputForm name="level" label="Level" required />
              </div>
            </div>

            <div className="space-y-2">
              <InputForm name="name" label="Level Name" required />
            </div>

            <div className="space-y-2">
              <TextAreaForm name="description" label="Description" required />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
                className="px-6 border-[#0e7490] text-[#0e7490] hover:bg-[#0e7490]/5"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="px-8 bg-[#0e7490] hover:bg-[#0c6380] text-white"
              >
                {isSubmitting ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
