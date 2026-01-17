import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createPenalty } from "@/services/employees/penalties";
import { IPenaltyRequest } from "@/services/employees/penalties/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import dayjs from "dayjs";
import { ApiErrorResponse } from "@/lib/types";

const penaltySchema = z.object({
  point: z.coerce.number().min(1, "Point must be at least 1"),
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  valid_until: z.date().nullable().optional(),
});

type PenaltyFormValues = z.infer<typeof penaltySchema>;

interface AddPenaltyModalProps {
  userId: number;
}

export function AddPenaltyModal({ userId }: AddPenaltyModalProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(penaltySchema),
    defaultValues: {
      point: 0,
      name: "",
      description: "",
      valid_until: null,
    },
  });

  const { mutate: submitPenalty, isPending } = useMutation({
    mutationFn: (data: IPenaltyRequest) => createPenalty(data),
    onSuccess: () => {
      toast.success("Penalty added successfully");
      queryClient.invalidateQueries({
        queryKey: ["employee-penalties", userId],
      });
      setOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      if (error?.response) {
        try {
          error.response
            .json()
            .then((errorData: ApiErrorResponse) => {
              toast.error(errorData.message || "Failed to add penalty");
            })
            .catch(() => {
              toast.error("Failed to add penalty: Server error");
            });
        } catch (parseError) {
          toast.error("Failed to add penalty: Server error");
        }
      } else {
        toast.error(
          `Failed to add penalty: ${error.message || "Unknown error"}`,
        );
      }
    },
  });

  const onSubmit = (values: PenaltyFormValues) => {
    submitPenalty({
      user_id: userId,
      point: values.point,
      name: values.name,
      description: values.description,
      valid_until: values.valid_until
        ? dayjs(values.valid_until).format("YYYY-MM-DD")
        : null,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Penalty
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Penalty</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="point"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Point</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      value={field.value as number}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Teguran Lisan" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Description..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DatePicker
              name="valid_until"
              label="Valid Until"
              isOptional
              placeholder="Pick a date"
            />
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
