"use client";

import { Form } from "@/components/ui/form";
import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { EmployeeinformationSection } from "../sections/employee-information-section";
import { PersonalInformationSection } from "../sections/personal-information-section";
import { SalaryInformationSection } from "../sections/salary-information-section";
import { BankInformationSection } from "../sections/bank-information-section";
import { AttachmentsSection } from "../sections/attachments-section";

import {
  createEmployeeManagementFormScheme,
  employeeManagementFormDefaultValues,
  type EmployeeManagementFormValues,
} from "../types";
import { IMutateEmployeeRequests } from "@/services/employees/types";
import dayjs from "dayjs";
import { useMutation } from "@tanstack/react-query";
import { createEmployee } from "@/services/employees";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { convertPhoneToNumber } from "@/lib/helpers";
import { ApiErrorResponse } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

type EmployeeFormValues = EmployeeManagementFormValues;

const serverFieldToFormField: Record<string, string> = {
  team_id: "team_member",
};

function mapServerFieldToFormField(fieldName: string): string {
  if (serverFieldToFormField[fieldName]) {
    return serverFieldToFormField[fieldName];
  }

  const attachmentMatch = fieldName.match(/^attachments\.(\d+)\.path$/);
  if (attachmentMatch) {
    return `attachments.${attachmentMatch[1]}.path`;
  }

  return fieldName;
}

function applyServerValidationErrors(
  form: ReturnType<typeof useForm<EmployeeFormValues>>,
  errors: Record<string, string[]>,
) {
  Object.entries(errors).forEach(([fieldName, messages]) => {
    form.setError(mapServerFieldToFormField(fieldName) as keyof EmployeeFormValues, {
      type: "server",
      message: messages[0],
    });
  });
}

function scrollToFirstValidationError() {
  requestAnimationFrame(() => {
    const firstInvalid = document.querySelector(
      '[data-invalid="true"], [aria-invalid="true"]',
    );
    firstInvalid?.scrollIntoView({ behavior: "smooth", block: "center" });
  });
}

export const AddEmployeeForm = React.memo(function AddEmployee() {
  const router = useRouter();
  const t = useTranslations("employee");
  const tCommon = useTranslations("common");
  const tValidation = useTranslations("validation");

  const employeeSchema = React.useMemo(
    () => createEmployeeManagementFormScheme(tValidation, t),
    [tValidation, t],
  );

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: employeeManagementFormDefaultValues,
    mode: "onChange",
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (params: IMutateEmployeeRequests) => createEmployee(params),
    onSuccess: () => {
      toast.success(t("employeeAddedSuccess"));
      router.push("/employee/employee-management");
      form.reset();
    },
    onError: async (error: Error & { response?: Response }) => {
      if (error?.response) {
        try {
          const errorData: ApiErrorResponse = await error.response.json();
          if (errorData.errors) {
            applyServerValidationErrors(form, errorData.errors);
          }
          toast.error(errorData.message || t("employeeAddFailed"));
          scrollToFirstValidationError();
        } catch {
          toast.error(t("employeeAddServerError"));
        }
      } else {
        toast.error(
          `${t("employeeAddFailed")}: ${error.message || "Unknown error"}`,
        );
      }
    },
  });

  const onSubmit = React.useCallback(
    (values: EmployeeFormValues) => {
      const filteredSocialMedia = values.social_media_accounts?.filter(
        (account) => account?.type.trim() !== "" && account?.url.trim() !== "",
      );

      const { end_date, countryCode, team_member, ...restValues } = values;

      const params: IMutateEmployeeRequests = {
        ...restValues,
        role_id: Number(values.role_id),
        department_id: Number(values.department_id),
        job_level_id: Number(values.job_level_id),
        job_position_id: Number(values.job_position_id),
        status: String(Number(values.status) || 1),
        marital_status: String(Number(values.marital_status) || 1),
        ...(filteredSocialMedia && {
          social_media_accounts: filteredSocialMedia,
        }),
        country_code: String(values.country_code),
        branch_id: Number(values.branch_id),
        team_id: Number(team_member),
        date_of_birth: dayjs(values.date_of_birth).format("YYYY-MM-DD"),
        start_date: dayjs(values.start_date).format("YYYY-MM-DD"),
        ...(end_date && dayjs(end_date).isValid()
          ? { end_date: dayjs(end_date).format("YYYY-MM-DD") }
          : {}),
        allowances: values.allowances?.map((item) => ({
          allowance_type_id: Number(item?.allowance_type_id),
          allowance_value: Number(item?.allowance_value),
        })),
        phone_number: Number(convertPhoneToNumber(String(values.phone_number))),
        bank_id: Number(values.bank_id),
        work_experiences: values.work_experiences?.filter((item) => item.id),
        contact_refferences: values.contact_refferences?.filter(
          (item) => item.id,
        ),
        families: values.families?.filter((item) => item.id),
        educations: values.educations?.filter((item) => item.id),
        ...(values.primary_direct_report_id !== 0
          ? {
              primary_direct_report_id: Number(values.primary_direct_report_id),
            }
          : { primary_direct_report_id: null }),
        ...(values.additional_direct_report_id !== 0
          ? {
              additional_direct_report_id: Number(
                values.additional_direct_report_id,
              ),
            }
          : { additional_direct_report_id: null }),
        ...(values.attachments && {
          attachments: values.attachments
            .filter(
              (item) =>
                item.type !== undefined &&
                item.path !== undefined &&
                item.path.trim() !== "",
            )
            .map((item) => ({ type: item.type, path: item.path })),
        }),
      };

      mutate(params);
    },
    [mutate],
  );

  const handleAddEmployee = React.useCallback(async () => {
    const isValid = await form.trigger();

    if (!isValid) {
      toast.error(t("formValidationFailed"));
      scrollToFirstValidationError();
      return;
    }

    const formData = form.getValues();
    onSubmit(formData);
  }, [form, onSubmit, t]);

  return (
    <>
      <Form {...form}>
        <form>
          <PersonalInformationSection />
          <EmployeeinformationSection />
          <SalaryInformationSection />
          <BankInformationSection />
          <AttachmentsSection />
          <div className="flex gap-2 my-8 justify-between md:justify-start w-full">
            <Button
              variant="outline"
              className="md:max-w-36 w-[50%]"
              type="button"
              disabled={isPending}
              onClick={() => router.push("/employee/employee-management")}
            >
              {tCommon("cancel")}
            </Button>
            <Button
              type="button"
              disabled={isPending}
              isLoading={isPending}
              className="md:max-w-36 w-[50%]"
              onClick={handleAddEmployee}
            >
              {t("addEmployee")}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
});
