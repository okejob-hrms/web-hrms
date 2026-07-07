/* eslint-disable @typescript-eslint/no-explicit-any */
import { Form } from "@/components/ui/form";
import * as React from "react";
import { useForm } from "react-hook-form";
import { InputForm } from "@/components/ui/input";
import { SelectForm } from "@/components/ui/select-form";
import { Button } from "@/components/ui/button";
import { Plus, Trash } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAllowanceTypes } from "@/services/allowance-types";
import { TextAreaForm } from "@/components/ui/textarea";
import { SalaryAdjustmentModal } from "./modals/salary-adjustment-modal";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  defaultFinalSalaryAdjustmentForm,
  IMutateFinalSalaryRequest,
  MutateFinalSalaryRequestSchema,
} from "@/services/employees/offboardings/final-salary/types";
import { toast } from "sonner";
import { getShowFinalSalary, postFinalSalary } from "@/services/employees/offboardings/final-salary";
import { useRouter } from "next/navigation";
import { ApiErrorResponse } from "@/lib/types";
import { useTranslations } from "next-intl";

interface Props {
  offboarding_id: number;
}

export const SalaryAdjustmentForm = React.memo(function SalaryAdjustmentForm({
  offboarding_id,
}: Props) {
  const t = useTranslations("offboarding");
  const tEmployee = useTranslations("employee");
  const tCommon = useTranslations("common");
  const queryClient = useQueryClient();
  const router = useRouter();
  const form = useForm<z.infer<typeof MutateFinalSalaryRequestSchema>>({
    resolver: zodResolver(MutateFinalSalaryRequestSchema),
    defaultValues: defaultFinalSalaryAdjustmentForm,
  });
  const [allowanceForm, setAllowanceForm] = React.useState(1);
  // const watchedAllowances = form.watch("allowances");
  const { data: allowanceTypes } = useQuery({
    queryKey: ["allowances"],
    queryFn: getAllowanceTypes,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: salaryData } = useQuery({
    queryKey: ["final-salary", offboarding_id],
    queryFn: () => getShowFinalSalary(offboarding_id),
    enabled: !!offboarding_id,
  });

  React.useEffect(() => {
    if (salaryData?.data) {
      form.reset({
        ...defaultFinalSalaryAdjustmentForm,
        base_salary: Number(salaryData.data.base_salary ?? 0),
        salary_nett: Number(salaryData.data.salary_nett ?? 0),
        overtime_amount: salaryData.data.overtime_amount ? Number(salaryData.data.overtime_amount) : null,
        bonus_amount: salaryData.data.bonus_amount ? Number(salaryData.data.bonus_amount) : null,
        reimbursement_amount: salaryData.data.reimbursement_amount ? Number(salaryData.data.reimbursement_amount) : null,
        deduction_amount: salaryData.data.deduction_amount ? Number(salaryData.data.deduction_amount) : null,
        notes: salaryData.data.notes ?? null,
      } as any);
    }
  }, [salaryData?.data, form]);


  const allowanceTypesOptions = React.useMemo(() => {
    if (allowanceTypes?.data) {
      return allowanceTypes.data.map((item) => ({
        label: item.name,
        value: item.id.toString(),
      }));
    }
    return [];
  }, [allowanceTypes?.data]);

  const { mutate, isPending } = useMutation({
    mutationFn: (params: IMutateFinalSalaryRequest) =>
      postFinalSalary(offboarding_id, params),
    onSuccess: () => {
      toast.success(t("salaryAdjustmentSuccess"));
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      router.push("/employee/employee-management");
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
              toast.error(
                errorData.message || t("salaryAdjustmentFailed"),
              );
            })
            .catch(() => {
              toast.error(t("salaryAdjustmentServerError"));
            });
        } catch (parseError) {
          toast.error(t("salaryAdjustmentServerError"));
        }
      } else {
        toast.error(
          `${t("salaryAdjustmentFailed")}: ${error.message || t("unknownError")}`,
        );
      }
    },
  });

  const onSubmit = React.useCallback(
    (values: z.infer<typeof MutateFinalSalaryRequestSchema>) => {
      console.log("values", values);
      const {
        overtime_amount,
        bonus_amount,
        reimbursement_amount,
        deduction_amount,
        notes,
      } = values;
      mutate({
        overtime_amount,
        bonus_amount,
        reimbursement_amount,
        deduction_amount,
        notes,
      });
    },
    [mutate],
  );

  const handleUpdateEmployee = React.useCallback(async () => {
    const isValid = await form.trigger();
    const formData = form.getValues();

    console.log("# ERROR EDIT ", form.formState.errors);
    if (!isValid) {
      return;
    }
    onSubmit(formData);
  }, [form, onSubmit]);

  return (
    <div className="space-y-2">
      <h2 className="font-semibold text-lg md:col-span-3">{t("earnings")}</h2>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid grid-cols-1 md:grid-cols-2 gap-3 items-start"
        >
          <InputForm
            name="base_salary"
            label={tEmployee("baseSalary")}
            disabled
            iconPosition="left"
            type="number"
            icon={<span className="text-text-disabled text-base">Rp</span>}
          />
          <InputForm
            name="salary_nett"
            label={tEmployee("salaryNett")}
            disabled
            iconPosition="left"
            type="number"
            icon={<span className="text-text-disabled text-base">Rp</span>}
          />
          <h3 className="text-base text-black font-semibold md:col-span-2">
            {tEmployee("allowance")}
          </h3>
          {allowanceForm > 0 &&
            [...Array(allowanceForm)].map((_, index) => (
              <div
                key={index}
                className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-3 w-full items-start"
              >
                <SelectForm
                  name={`allowances.${index}.allowance_type_id`}
                  label={t("allowanceType")}
                  options={allowanceTypesOptions}
                />
                <div className="flex gap-2 items-end">
                  <InputForm
                    name={`allowances.${index}.allowance_value`}
                    label={t("allowanceValue")}
                    // disabled={
                    //   watchedAllowances &&
                    //   !watchedAllowances[index]?.allowance_type_id
                    // }
                    className="w-full"
                    iconPosition="left"
                    type="number"
                    icon={
                      <span className="text-text-disabled text-base">Rp</span>
                    }
                  />
                  <Button
                    variant="ghost"
                    className="w-fit"
                    onClick={() => setAllowanceForm((prev) => prev - 1)}
                  >
                    <Trash />
                  </Button>
                </div>
              </div>
            ))}
          <Button
            variant="ghost"
            className="w-fit text-primary"
            type="button"
            onClick={() => setAllowanceForm((prev) => prev + 1)}
          >
            <Plus /> {t("addAllowance")}
          </Button>
          <div className="flex flex-col gap-1 w-full col-span-2">
            <h3 className="text-base text-black font-semibold md:col-span-2">
              {t("overtime")}
            </h3>
            <p className="text-text-secondary text-sm font-normal">
              {t("approvedOvertimeHours", { hours: 20 })}
            </p>
          </div>
          <InputForm
            name="overtime_amount"
            label={t("overtimeAmount")}
            iconPosition="left"
            type="number"
            icon={<span className="text-text-disabled text-base">Rp</span>}
          />
          <h3 className="text-base text-black font-semibold md:col-span-2">
            {t("additionalEarnings")}
          </h3>
          <InputForm
            name="bonus_amount"
            label={t("bonus")}
            iconPosition="left"
            type="number"
            icon={<span className="text-text-disabled text-base">Rp</span>}
          />
          <InputForm
            name="reimbursement_amount"
            label={t("reimbursement")}
            iconPosition="left"
            type="number"
            icon={<span className="text-text-disabled text-base">Rp</span>}
          />
          <InputForm
            name="deduction_amount"
            label={t("deductionAmount")}
            iconPosition="left"
            type="number"
            icon={<span className="text-text-disabled text-base">Rp</span>}
          />
          <TextAreaForm name="notes" label={tCommon("notes")} className="col-span-2" />
          <div className="w-full gap-2 mt-8 flex">
            <Button variant="outline" className="w-[174px]">
              {tCommon("cancel")}
            </Button>
            <SalaryAdjustmentModal
              onUpdate={handleUpdateEmployee}
              disabled={isPending}
            />
          </div>
        </form>
      </Form>
    </div>
  );
});
