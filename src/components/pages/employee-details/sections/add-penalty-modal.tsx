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
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import dayjs from "dayjs";
import { ApiErrorResponse } from "@/lib/types";
import { useTranslations } from "next-intl";

type PenaltyFormValues = z.infer<ReturnType<typeof createPenaltySchema>>;

function createPenaltySchema(t: (key: string) => string) {
  return z.object({
    point: z.coerce.number().min(1, t("penaltyPointMin")),
    name: z.string().min(1, t("nameRequired")),
    description: z.string().min(1, t("descriptionRequired")),
    valid_until: z.date().nullable().optional(),
  });
}

interface AddPenaltyModalProps {
  userId: number;
}

export function AddPenaltyModal({ userId }: AddPenaltyModalProps) {
  const t = useTranslations("employee");
  const tCommon = useTranslations("common");
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const penaltySchema = useMemo(() => createPenaltySchema(t), [t]);

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
      toast.success(t("penaltyAddedSuccess"));
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
              toast.error(errorData.message || t("penaltyAddFailed"));
            })
            .catch(() => {
              toast.error(`${t("penaltyAddFailed")}: ${tCommon("failed")}`);
            });
        } catch {
          toast.error(`${t("penaltyAddFailed")}: ${tCommon("failed")}`);
        }
      } else {
        toast.error(
          `${t("penaltyAddFailed")}: ${error.message || tCommon("failed")}`,
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
          {t("addPenalty")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("addPenalty")}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="point"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("penaltyPoint")}</FormLabel>
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
                  <FormLabel>{tCommon("name")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("penaltyNamePlaceholder")} {...field} />
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
                  <FormLabel>{tCommon("description")}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t("descriptionPlaceholder")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DatePicker
              name="valid_until"
              label={t("validUntil")}
              isOptional
              placeholder={tCommon("pickDate")}
            />
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                {tCommon("cancel")}
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? tCommon("submitting") : tCommon("submit")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
