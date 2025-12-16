import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TextAreaForm } from "@/components/ui/textarea";

const formSchema = z.object({
  title: z.string().min(1, "Objective is required"),
});

interface FormObjectiveProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (data: z.infer<typeof formSchema>) => void;
}

export const FormObjective = ({
  open,
  onOpenChange,
  onCreate,
}: FormObjectiveProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
    },
  });

  const handleSave = (): void => {
    onCreate({ title: form.getValues("title") });
    handleClose();
  };

  const handleClose = (): void => {
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 bg-white">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-xl font-semibold">
            Add New Objective
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((data) => console.log(data))}
            className="px-6 pb-6 space-y-5"
          >
            <TextAreaForm name="title" label="Objective" required />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button variant="outline" type="button" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="button" onClick={handleSave}>
                Create
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
