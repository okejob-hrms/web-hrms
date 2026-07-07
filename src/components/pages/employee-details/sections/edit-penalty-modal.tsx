import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { ApiErrorResponse } from "@/lib/types";
import {
  getDetailsPenalty,
  updatePenalty,
} from "@/services/employees/penalties";
import { IPenaltyRequest } from "@/services/employees/penalties/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
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

interface EditPenaltyModalProps {
  penaltyId: number | null;
  userId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditPenaltyModal({
  penaltyId,
  userId,
  open,
  onOpenChange,
}: EditPenaltyModalProps) {
  const t = useTranslations("employee");
  const tCommon = useTranslations("common");
  const queryClient = useQueryClient();

  const penaltySchema = useMemo(() => createPenaltySchema(t), [t]);

  const { data: penaltyData, isLoading: isLoadingDetails } = useQuery({
    queryKey: ["penalty-detail", penaltyId],
    queryFn: () => getDetailsPenalty(penaltyId!),
    enabled: !!penaltyId && open,
  });

  const form = useForm({
    resolver: zodResolver(penaltySchema),
    defaultValues: {
      point: 0,
      name: "",
      description: "",
      valid_until: null,
    },
  });

  useEffect(() => {
    if (penaltyData?.data) {
      const penalty = penaltyData.data;
      form.reset({
        point: penalty.point,
        name: penalty.name,
        description: penalty.description,
        valid_until: penalty.valid_until ? new Date(penalty.valid_until) : null,
      });
    }
  }, [penaltyData, form]);

  const { mutate: handleUpdate, isPending } = useMutation({
    mutationFn: (data: IPenaltyRequest) => updatePenalty(penaltyId!, data),
    onSuccess: () => {
      toast.success(t("penaltyUpdatedSuccess"));
      queryClient.invalidateQueries({
        queryKey: ["employee-penalties", userId],
      });
      queryClient.invalidateQueries({
        queryKey: ["penalty-detail", penaltyId],
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      if (error?.response) {
        try {
          error.response
            .json()
            .then((errorData: ApiErrorResponse) => {
              toast.error(errorData.message || t("penaltyEditFailed"));
            })
            .catch(() => {
              toast.error(`${t("penaltyEditFailed")}: ${tCommon("failed")}`);
            });
        } catch {
          toast.error(`${t("penaltyEditFailed")}: ${tCommon("failed")}`);
        }
      } else {
        toast.error(
          `${t("penaltyEditFailed")}: ${error.message || tCommon("failed")}`,
        );
      }
    },
  });

  const onSubmit = (values: PenaltyFormValues) => {
    handleUpdate({
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("editPenalty")}</DialogTitle>
        </DialogHeader>
        {isLoadingDetails ? (
          <div className="flex justify-center p-4">{t("loadingDetails")}</div>
        ) : (
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
                      <Input
                        placeholder={t("penaltyNamePlaceholder")}
                        {...field}
                      />
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
                  onClick={() => onOpenChange(false)}
                >
                  {tCommon("cancel")}
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? tCommon("saving") : tCommon("saveChanges")}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
