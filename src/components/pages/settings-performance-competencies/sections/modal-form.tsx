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
import { usePerformanceCompetenciesList } from "../hook";

interface CompetencyModalFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CompetencyModalForm: React.FC<CompetencyModalFormProps> = ({
  open,
  onOpenChange,
}) => {
  const { form, handleSave, isSubmitting } = usePerformanceCompetenciesList();

  const handleClose = (): void => {
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 bg-white">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-xl font-semibold">
            New Performance Competency
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSave} className="px-6 pb-6 space-y-5">
            <div className="space-y-2">
              <InputForm name="code" label="Competency Code" required />
            </div>

            <div className="space-y-2">
              <InputForm name="name" label="Competency Name" required />
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
