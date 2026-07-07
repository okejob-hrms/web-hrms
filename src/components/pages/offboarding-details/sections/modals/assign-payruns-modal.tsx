/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { SelectForm } from "@/components/ui/select-form";
import { postAssignPayruns } from "@/services/employees/offboardings/final-salary";
import { useMutation } from "@tanstack/react-query";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ApiErrorResponse } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";
import { useTranslations } from "next-intl";

interface Props {
  offboarding_id: number;
  isEdit?: boolean;
}

const formSchema = z.object({
  assign_payruns: z.string().min(1, "required"),
});

type FormValues = z.infer<typeof formSchema>;

export const AssignPayrunsModal = React.memo(
  function AssignPayrunsModal({ offboarding_id, isEdit }: Props) {
    const t = useTranslations("offboarding");
    const tCommon = useTranslations("common");
    const [open, setOpen] = React.useState(false);

    const form = useForm<FormValues>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        assign_payruns: "",
      },
    });

    const mutation = useMutation({
      mutationFn: (date: string) => postAssignPayruns(offboarding_id, date),
      onSuccess: () => {
        toast.success(t("assignPayrunsSuccess"));
        setOpen(false);
        form.reset();
      },
      onError: (error: any) => {
        console.log("error ", error);
        if (error?.response) {
          try {
            error.response
              .json()
              .then((errorData: ApiErrorResponse) => {
                toast.error(errorData.message || t("assignPayrunsFailed"));
              })
              .catch(() => {
                toast.error(`${t("assignPayrunsFailed")}: ${t("serverError")}`);
              });
          } catch (parseError) {
            toast.error(
              `${t("assignPayrunsFailed")}: ${t("serverError")} : ${parseError}`,
            );
          }
        } else {
          toast.error(
            `${t("assignPayrunsFailed")}: ${error.message || t("unknownError")}`,
          );
        }
      },
    });

    const onSubmit = (values: FormValues) => {
      console.log("Form submitted with values:", values);
      mutation.mutate(values.assign_payruns);
    };

    const handleOpenChange = (open: boolean) => {
      setOpen(open);
      if (!open) {
        form.reset();
      }
    };

    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          {isEdit ? (
            <Button
              variant="ghost"
              className="font-semibold text-primary text-sm hover:text-primary"
            >
              <Image
                src="/icons/editBlue.svg"
                width={24}
                height={24}
                alt="edit"
              />{" "}
              {tCommon("edit")}
            </Button>
          ) : (
            <Button className="w-fit">{t("assignToPayruns")}</Button>
          )}
        </DialogTrigger>
        <DialogContent className="bg-white md:min-w-5xl overflow-y-scroll max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{t("assignFinalSalaryPayout")}</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <SelectForm
                name="assign_payruns"
                label={t("assignPayruns")}
                required
                options={[
                  { label: "Juni 2025", value: "2025-06-01" },
                  { label: "Juli 2025", value: "2025-07-01" },
                  { label: "Agustus 2025", value: "2025-08-01" },
                  { label: "September 2025", value: "2025-09-01" },
                  { label: "Oktober 2025", value: "2025-10-01" },
                  { label: "November 2025", value: "2025-11-01" },
                  { label: "Desember 2025", value: "2025-12-01" },
                  { label: "Januari 2026", value: "2025-01-01" },
                  { label: "Februari 2026", value: "2025-02-01" },
                  { label: "Maret 2026", value: "2025-03-01" },
                ]}
              />

              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    {tCommon("cancel")}
                  </Button>
                </DialogClose>
                <Button
                  type="submit"
                  disabled={mutation.isPending || !form.formState.isDirty}
                >
                  {mutation.isPending ? tCommon("saving") : tCommon("save")}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    );
  },
);
