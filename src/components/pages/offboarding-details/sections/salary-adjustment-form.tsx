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
  IMutateFinalSalaryRequest,
  MutateFinalSalaryRequestSchema,
} from "@/services/employees/offboardings/final-salary/types";
import { toast } from "sonner";
import { postFinalSalary } from "@/services/employees/offboardings/final-salary";
import { useRouter } from "next/navigation";
import { ApiErrorResponse } from "@/lib/types";

interface Props {
  offboarding_id: number;
}

export const SalaryAdjustmentForm = React.memo(function SalaryAdjustmentForm({
  offboarding_id,
}: Props) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const form = useForm<z.infer<typeof MutateFinalSalaryRequestSchema>>({
    resolver: zodResolver(MutateFinalSalaryRequestSchema),
  });
  const [allowanceForm, setAllowanceForm] = React.useState(1);
  // const watchedAllowances = form.watch("allowances");
  const { data: allowanceTypes } = useQuery({
    queryKey: ["allowances"],
    queryFn: getAllowanceTypes,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const allowanceTypesOptions = React.useMemo(() => {
    if (allowanceTypes?.data.data) {
      return allowanceTypes.data.data.map((item) => ({
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
      toast.success("Edit employee successfully!");
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
              toast.error(errorData.message || "Failed to update employee");
            })
            .catch(() => {
              toast.error("Failed to update employee: Server error");
            });
        } catch (parseError) {
          toast.error("Failed to update employee: Server error");
        }
      } else {
        toast.error(
          `Failed to edit employee: ${error.message || "Unknown error"}`,
        );
      }
    },
  });

  const onSubmit = React.useCallback(
    (values: z.infer<typeof MutateFinalSalaryRequestSchema>) => {
      console.log("values", values);
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
      <h2 className="font-semibold text-lg md:col-span-3">Earnings</h2>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid grid-cols-1 md:grid-cols-2 gap-3 items-start"
        >
          <InputForm
            name="base_salary"
            label="Base Salary"
            disabled
            iconPosition="left"
            type="number"
            icon={<span className="text-text-disabled text-base">Rp</span>}
          />
          <InputForm
            name="salary_nett"
            label="Salary (Nett)"
            disabled
            iconPosition="left"
            type="number"
            icon={<span className="text-text-disabled text-base">Rp</span>}
          />
          <h3 className="text-base text-black font-semibold md:col-span-2">
            Allowance
          </h3>
          {allowanceForm > 0 &&
            [...Array(allowanceForm)].map((_, index) => (
              <div
                key={index}
                className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-3 w-full items-start"
              >
                <SelectForm
                  name={`allowances.${index}.allowance_type_id`}
                  label="Allowance Type"
                  options={allowanceTypesOptions}
                />
                <div className="flex gap-2 items-end">
                  <InputForm
                    name={`allowances.${index}.allowance_value`}
                    label="Allowance Value"
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
            <Plus /> Add Allowance
          </Button>
          <div className="flex flex-col gap-1 w-full col-span-2">
            <h3 className="text-base text-black font-semibold md:col-span-2">
              Overtime
            </h3>
            <p className="text-text-secondary text-sm font-normal">
              Approved Overtime :{" "}
              <span className="font-semibold text-foreground">20</span> hours
            </p>
          </div>
          <InputForm
            name="overtime_amount"
            label="Overtime Amount"
            iconPosition="left"
            type="number"
            icon={<span className="text-text-disabled text-base">Rp</span>}
          />
          <h3 className="text-base text-black font-semibold md:col-span-2">
            Additional Earnings
          </h3>
          <InputForm
            name="bonus_amount"
            label="Bonus"
            iconPosition="left"
            type="number"
            icon={<span className="text-text-disabled text-base">Rp</span>}
          />
          <InputForm
            name="reimbursement_amount"
            label="Reimbursement"
            iconPosition="left"
            type="number"
            icon={<span className="text-text-disabled text-base">Rp</span>}
          />
          <InputForm
            name="deduction_amount"
            label="Deduction Amount"
            iconPosition="left"
            type="number"
            icon={<span className="text-text-disabled text-base">Rp</span>}
          />
          <TextAreaForm name="notes" label="Notes" className="col-span-2" />
          <div className="w-full gap-2 mt-8 flex">
            <Button variant="outline" className="w-[174px]">
              Cancel
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
