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
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";

interface CompetencyFormData {
  code: string;
  name: string;
  description: string;
}

interface CompetencyModalFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: CompetencyFormData) => void;
}

export const CompetencyModalForm: React.FC<CompetencyModalFormProps> = ({
  open,
  onOpenChange,
  onSave,
}) => {
  const [formData, setFormData] = React.useState<CompetencyFormData>({
    code: "",
    name: "",
    description: "",
  });

  const form = useForm();

  const handleInputChange = (
    field: keyof CompetencyFormData,
    value: string,
  ): void => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = (): void => {
    onSave(formData);
    handleClose();
  };

  const handleClose = (): void => {
    setFormData({ code: "", name: "", description: "" });
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
          <form className="px-6 pb-6 space-y-5">
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
                className="px-6 border-[#0e7490] text-[#0e7490] hover:bg-[#0e7490]/5"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSave}
                className="px-8 bg-[#0e7490] hover:bg-[#0c6380] text-white"
              >
                Save
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
