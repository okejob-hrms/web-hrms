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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Form } from "@/components/ui/form";
import { InputForm } from "@/components/ui/input";
import { SelectForm } from "@/components/ui/select-form";
import { TextAreaForm } from "@/components/ui/textarea";
import { ApiErrorResponse } from "@/lib/types";
import { rupiahFormatter } from "@/lib/helpers";
import { getAllowanceTypes } from "@/services/allowance-types";
import {
  getShowFinalSalary,
  postFinalSalary,
} from "@/services/employees/offboardings/final-salary";
import {
  defaultFinalSalaryAdjustmentForm,
  IMutateFinalSalaryRequest,
  MutateFinalSalaryRequestSchema,
} from "@/services/employees/offboardings/final-salary/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import * as React from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

type FormValues = z.infer<typeof MutateFinalSalaryRequestSchema>;

interface Props {
  offboarding_id: number;
}

const CurrencyIcon = () => (
  <span className="text-text-disabled text-base">Rp</span>
);

export const SalaryAdjustmentModal = React.memo(function SalaryAdjustmentModal({
  offboarding_id,
}: Props) {
  const t = useTranslations("offboarding");
  const tEmployee = useTranslations("employee");
  const tCommon = useTranslations("common");
  const queryClient = useQueryClient();

  const [open, setOpen] = React.useState(false);
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(MutateFinalSalaryRequestSchema),
    defaultValues: defaultFinalSalaryAdjustmentForm,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "allowances" as never,
  });

  const { data: allowanceTypes } = useQuery({
    queryKey: ["allowances"],
    queryFn: getAllowanceTypes,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: open,
  });

  const { data: salaryData, isLoading: isLoadingSalary } = useQuery({
    queryKey: ["final-salary", offboarding_id],
    queryFn: () => getShowFinalSalary(offboarding_id),
    enabled: !!offboarding_id && open,
  });

  React.useEffect(() => {
    if (!open || !salaryData?.data) return;

    const allowances =
      salaryData.data.allowances
        ?.filter((item) => item.allowance_type_id != null)
        .map((item) => ({
          allowance_type_id: Number(item.allowance_type_id),
          amount: Number(item.amount ?? 0),
        })) ?? [];

    form.reset({
      ...defaultFinalSalaryAdjustmentForm,
      overtime_amount: salaryData.data.overtime_amount
        ? Number(salaryData.data.overtime_amount)
        : null,
      bonus_amount: salaryData.data.bonus_amount
        ? Number(salaryData.data.bonus_amount)
        : null,
      reimbursement_amount: salaryData.data.reimbursement_amount
        ? Number(salaryData.data.reimbursement_amount)
        : null,
      deduction_amount: salaryData.data.deduction_amount
        ? Number(salaryData.data.deduction_amount)
        : null,
      notes: salaryData.data.notes ?? null,
      allowances,
    });
  }, [open, salaryData?.data, form]);

  const allowanceTypesOptions = React.useMemo(() => {
    if (!allowanceTypes?.data) return [];
    return allowanceTypes.data.map((item) => ({
      label: item.name,
      value: item.id.toString(),
    }));
  }, [allowanceTypes?.data]);

  const { mutate, isPending } = useMutation({
    mutationFn: (params: IMutateFinalSalaryRequest) =>
      postFinalSalary(offboarding_id, params),
    onSuccess: () => {
      toast.success(t("salaryAdjustmentSuccess"));
      queryClient.invalidateQueries({ queryKey: ["salary", offboarding_id] });
      queryClient.invalidateQueries({
        queryKey: ["final-salary", offboarding_id],
      });
      setConfirmOpen(false);
      setOpen(false);
      form.reset(defaultFinalSalaryAdjustmentForm);
    },
    onError: (error: any) => {
      if (error?.response) {
        try {
          error.response
            .json()
            .then((errorData: ApiErrorResponse) => {
              if (errorData.errors) {
                Object.entries(errorData.errors).forEach(
                  ([fieldName, messages]) => {
                    form.setError(fieldName as any, {
                      type: "server",
                      message: messages[0],
                    });
                  },
                );
              }
              toast.error(errorData.message || t("salaryAdjustmentFailed"));
            })
            .catch(() => {
              toast.error(t("salaryAdjustmentServerError"));
            });
        } catch {
          toast.error(t("salaryAdjustmentServerError"));
        }
      } else {
        toast.error(
          `${t("salaryAdjustmentFailed")}: ${error.message || t("unknownError")}`,
        );
      }
    },
  });

  const buildPayload = (values: FormValues): IMutateFinalSalaryRequest => {
    const allowances =
      values.allowances
        ?.filter(
          (item) =>
            item.allowance_type_id != null &&
            item.amount != null &&
            !Number.isNaN(Number(item.amount)),
        )
        .map((item) => ({
          allowance_type_id: Number(item.allowance_type_id),
          amount: Number(item.amount),
        })) ?? [];

    return {
      overtime_amount: values.overtime_amount,
      bonus_amount: values.bonus_amount,
      reimbursement_amount: values.reimbursement_amount,
      deduction_amount: values.deduction_amount,
      notes: values.notes,
      allowances: allowances.length > 0 ? allowances : null,
    };
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      setConfirmOpen(false);
      form.reset(defaultFinalSalaryAdjustmentForm);
    }
  };

  const handleRequestSave = async () => {
    const isValid = await form.trigger();
    if (!isValid) return;
    setConfirmOpen(true);
  };

  const handleConfirmSave = () => {
    mutate(buildPayload(form.getValues()));
  };

  const baseSalary = Number(salaryData?.data?.base_salary ?? 0);
  const salaryNett = Number(
    salaryData?.data?.salary_nett_prorated ?? salaryData?.data?.salary_nett ?? 0,
  );
  const watchedValues = form.watch();

  const estimatedTotal = React.useMemo(() => {
    const allowancesTotal = (watchedValues.allowances ?? []).reduce(
      (sum, item) => sum + (Number(item?.amount) || 0),
      0,
    );

    return (
      salaryNett +
      (Number(watchedValues.overtime_amount) || 0) +
      (Number(watchedValues.bonus_amount) || 0) +
      (Number(watchedValues.reimbursement_amount) || 0) +
      allowancesTotal -
      (Number(watchedValues.deduction_amount) || 0)
    );
  }, [salaryNett, watchedValues]);

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button className="font-semibold text-white text-sm hover:text-white">
            <Image
              src="/icons/edit.svg"
              width={24}
              height={24}
              alt={tCommon("edit")}
            />
            {t("salaryAdjustment")}
          </Button>
        </DialogTrigger>

        <DialogContent className="bg-white md:min-w-4xl lg:min-w-5xl overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{t("salaryAdjustment")}</DialogTitle>
            <p className="text-sm text-text-secondary">
              {t("salaryAdjustmentDesc")}
            </p>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-lg border border-grayscale-20 bg-grayscale-10/40 p-4">
            <div className="space-y-1">
              <p className="text-xs text-text-secondary">
                {tEmployee("baseSalary")}{" "}
                <span className="text-text-disabled">
                  ({t("displayOnly")})
                </span>
              </p>
              <p className="text-base font-semibold text-black">
                {isLoadingSalary ? "…" : rupiahFormatter(baseSalary)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-text-secondary">
                {tEmployee("salaryNett")}
              </p>
              <p className="text-base font-semibold text-black">
                {isLoadingSalary ? "…" : rupiahFormatter(salaryNett)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-text-secondary">{t("totalGrossPay")}</p>
              <p className="text-base font-semibold text-primary">
                {isLoadingSalary ? "…" : rupiahFormatter(estimatedTotal)}
              </p>
            </div>
          </div>

          <Form {...form}>
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <section className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-black">
                    {tEmployee("allowance")}
                  </h3>
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-8 px-2 text-primary"
                    onClick={() =>
                      append({
                        allowance_type_id: null,
                        amount: null,
                      } as any)
                    }
                  >
                    <Plus className="size-4" />
                    {t("addAllowance")}
                  </Button>
                </div>

                {fields.length === 0 ? (
                  <p className="text-sm text-text-secondary rounded-md border border-dashed border-grayscale-20 px-3 py-4">
                    {t("noAllowancesAdded")}
                  </p>
                ) : (
                  <div className="space-y-3">
                    {fields.map((field, index) => (
                      <div
                        key={field.id}
                        className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3 items-end rounded-md border border-grayscale-20 p-3"
                      >
                        <SelectForm
                          name={`allowances.${index}.allowance_type_id`}
                          label={t("allowanceType")}
                          options={allowanceTypesOptions}
                          type="number"
                        />
                        <InputForm
                          name={`allowances.${index}.amount`}
                          label={t("allowanceValue")}
                          type="number"
                          iconPosition="left"
                          icon={<CurrencyIcon />}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          className="text-error"
                          onClick={() => remove(index)}
                          aria-label={tCommon("delete")}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="space-y-3">
                <h3 className="text-sm font-semibold text-black">
                  {t("overtime")}
                </h3>
                <InputForm
                  name="overtime_amount"
                  label={t("overtimeAmount")}
                  type="number"
                  iconPosition="left"
                  icon={<CurrencyIcon />}
                />
              </section>

              <section className="space-y-3">
                <h3 className="text-sm font-semibold text-black">
                  {t("additionalEarnings")}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <InputForm
                    name="bonus_amount"
                    label={t("bonus")}
                    type="number"
                    iconPosition="left"
                    icon={<CurrencyIcon />}
                  />
                  <InputForm
                    name="reimbursement_amount"
                    label={t("reimbursement")}
                    type="number"
                    iconPosition="left"
                    icon={<CurrencyIcon />}
                  />
                  <InputForm
                    name="deduction_amount"
                    label={t("deductionAmount")}
                    type="number"
                    iconPosition="left"
                    icon={<CurrencyIcon />}
                  />
                </div>
              </section>

              <TextAreaForm name="notes" label={tCommon("notes")} />

              <DialogFooter className="gap-2 sm:gap-0">
                <DialogClose asChild>
                  <Button type="button" variant="outline" disabled={isPending}>
                    {tCommon("cancel")}
                  </Button>
                </DialogClose>
                <Button
                  type="button"
                  onClick={handleRequestSave}
                  disabled={isPending || isLoadingSalary}
                >
                  {isPending ? tCommon("saving") : tCommon("save")}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader className="items-center">
            <Image
              src="/icons/confirmation.svg"
              width={56}
              height={56}
              alt=""
            />
            <AlertDialogTitle className="text-center">
              {t("confirmSalaryAdjustment")}
            </AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter className="w-full grid grid-cols-2">
            <AlertDialogCancel disabled={isPending}>
              {tCommon("cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              className="text-white"
              onClick={(e) => {
                e.preventDefault();
                handleConfirmSave();
              }}
              disabled={isPending}
            >
              {isPending ? tCommon("saving") : tCommon("submit")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
});
