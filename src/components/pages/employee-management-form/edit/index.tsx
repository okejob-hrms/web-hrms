/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Form } from "@/components/ui/form";
import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { EmployeeinformationSection } from "../sections/employee-information-section";
import { PersonalInformationSection } from "../sections/personal-information-section";
import { SalaryInformationSection } from "../sections/salary-information-section";
import { BankInformationSection } from "../sections/bank-information-section";
import { AttachmentsSection } from "../sections/attachments-section";
import { Button } from "../../../ui/button";
import {
  employeeManagementFormDefaultValues,
  employeeManagementFormScheme,
} from "../types";
import { IMutateEmployeeRequests } from "@/services/employees/types";
import dayjs from "dayjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  updateEmployee,
  getEmployeeDetail,
  deleteEmployee,
} from "@/services/employees";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import EmployeeUpdateModal from "../sections/edit-modal";
import ArchieveEmployeeModal from "../sections/archieve-employee-modal";
import AppSkeleton from "@/components/partials/app-skeleton";
import { ApiErrorResponse } from "@/lib/types";

interface Props {
  employee_profile_id: number;
}

export const EditEmployeeForm = React.memo(function EditEmployee({
  employee_profile_id,
}: Props) {
  const router = useRouter();
  const [isDataLoaded, setIsDataLoaded] = React.useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["employee-detail", employee_profile_id],
    queryFn: () => getEmployeeDetail(employee_profile_id),
    refetchOnMount: "always",
    staleTime: 0,
  });
  const employeeDetails = data?.data;

  const { mutate: editEmployee, isPending: isPendingEditEmployee } =
    useMutation({
      mutationFn: (params: IMutateEmployeeRequests) =>
        updateEmployee(params, employee_profile_id),
      onSuccess: () => {
        toast.success("Edit employee successfully!");
        queryClient.invalidateQueries({ queryKey: ["employees"] });
        queryClient.invalidateQueries({ queryKey: ["employee-detail", employee_profile_id] });
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

  const { mutate: archieveEmployee, isPending: isPendingArchieveEmployee } =
    useMutation({
      mutationFn: () => deleteEmployee(employee_profile_id),
      onSuccess: () => {
        toast.success("Archive employee successfully!");

        router.push("/employee/employee-management");
      },
      onError: (error: any) => {
        toast.error(
          `Failed to archive employee: ${error.message || "Unknown error"}`,
        );
      },
    });

  const form = useForm<z.infer<typeof employeeManagementFormScheme>>({
    // resolver: zodResolver(employeeManagementFormScheme),
    defaultValues: employeeManagementFormDefaultValues,
    mode: "onChange",
  });

  const hasValidSocialMediaAccounts = React.useCallback((accounts: any[]) => {
    return (
      accounts &&
      accounts.length > 0 &&
      accounts.some(
        (account) =>
          account?.type &&
          account?.url &&
          account.type.trim() !== "" &&
          account.url.trim() !== "",
      )
    );
  }, []);

  const filterValidData = React.useCallback(
    (data: any[], requiredFields: string[]) => {
      if (!data || !Array.isArray(data) || data.length === 0) {
        return [];
      }

      return data.filter(
        (item) =>
          item &&
          requiredFields.every(
            (field) =>
              item[field] !== undefined &&
              item[field] !== null &&
              String(item[field]).trim() !== "",
          ),
      );
    },
    [],
  );

  React.useEffect(() => {
    if (employeeDetails) {
      const socialMediaAccounts = employeeDetails.social_media_accounts || [];
      const validSocialMedia =
        socialMediaAccounts.length > 0
          ? socialMediaAccounts.map((item) => ({
              url: item.url || "",
              type: item.type || "",
            }))
          : [{ type: "", url: "" }];
      const formValues = {
        ...employeeDetails,
        name: employeeDetails.user?.name || "",
        email: employeeDetails.user?.email || "",
        phone_number: employeeDetails.phone_number?.toString() || "",
        date_of_birth: employeeDetails.date_of_birth
          ? new Date(employeeDetails.date_of_birth)
          : new Date(),
        start_date: employeeDetails.employment?.start_date
          ? dayjs(employeeDetails.employment.start_date).format("YYYY-MM-DD")
          : "",
        end_date: employeeDetails.employment?.end_date
          ? dayjs(employeeDetails.employment.end_date).format("YYYY-MM-DD")
          : "",
        blood_type: employeeDetails.blood_type || "",
        marital_status: employeeDetails.marital_status?.toString() || "",
        height: Number(employeeDetails.height) || 0,
        weight: Number(employeeDetails.weight) || 0,
        gender: employeeDetails.gender || "",
        place_of_birth: employeeDetails.place_of_birth || "",
        id_number: employeeDetails.id_number || "",
        npwp: employeeDetails.npwp || "",
        bpjs: employeeDetails.bpjs || "",
        citizen_id_address: employeeDetails.citizen_id_address || "",
        residential_address: employeeDetails.residential_address || "",
        hobby: employeeDetails.hobby || "",
        achievement: employeeDetails.achievement || "",
        personal_description: employeeDetails.personal_description || "",
        photo_profile: employeeDetails.photo_profile || "",
        branch_id: employeeDetails.branch?.id.toString() || "",
        role_id: employeeDetails.employment?.job_level_id?.toString() || "",
        job_position_id:
          employeeDetails.employment?.job_position_id?.toString() || "",
        department_id:
          employeeDetails.employment?.department_id?.toString() || "",
        job_level_id:
          employeeDetails.employment?.job_level_id?.toString() || "",
        status: employeeDetails.employment?.status?.toString() || "",
        team_member: employeeDetails.team_member?.team_id?.toString() || "",
        // base_salary: Number(employeeDetails.employment?.base_salary) || 0,
        salary_nett: Number(employeeDetails.employment?.salary_nett) || 0,
        allowances: (employeeDetails.employment?.allowances || [])?.map(
          (item) => ({
            allowance_type_id: item.allowance_type_id?.toString() || "",
            allowance_value: Number(item.allowance_value) || 0,
            allowance_name: item.allowance_name || "",
          }),
        ),
        bank_id: employeeDetails.bank_account?.bank_id?.toString() || "",
        account_number:
          employeeDetails.bank_account?.account_number?.toString() || "",
        account_name: employeeDetails.bank_account?.account_name || "",
        social_media_accounts: validSocialMedia,
        attachments: [],
        families: employeeDetails.families || [],
        educations: employeeDetails.educations || [],
        work_experiences: employeeDetails.work_experiences || [],
        contact_refferences: employeeDetails.contact_refferences || [],
        ...(employeeDetails.reporting_relationships.length > 0 && {
          primary_direct_report_id: Number(
            employeeDetails.reporting_relationships.filter(
              (item) => item.relationship_type === "primary",
            )[0]?.direct_report_id || 0,
          ),
          additional_direct_report_id: (() => {
            const secondaryReport =
              employeeDetails.reporting_relationships.filter(
                (item) => item.relationship_type === "secondary",
              )[0]?.direct_report_id;
            return secondaryReport ? Number(secondaryReport) : null;
          })(),
        }),
      };

      setTimeout(() => {
        form.reset(formValues);
        setIsDataLoaded(true);
      }, 0);
    }
  }, [employeeDetails, form]);

  const onSubmit = React.useCallback(
    (values: z.infer<typeof employeeManagementFormScheme> | any) => {
      try {
        const {
          country_code,
          employee_documents,
          attachments,
          work_experiences,
          educations,
          contact_refferences,
          families,
          social_media_accounts,
          allowances,
          team_member,
          id,
          user_id,
          user,
          marital_status_label,
          branch,
          employment,
          bank_account,
          reporting_relationships,
          photo_profile_url,
          updated_at,
          ...restValues
        } = values;

        const validSocialMedia = filterValidData(social_media_accounts || [], [
          "type",
          "url",
        ]);

        const validAllowances = filterValidData(allowances || [], [
          "allowance_type_id",
          "allowance_value",
          "allowance_name",
        ]).map((item) => ({
          allowance_type_id: Number(item.allowance_type_id),
          allowance_value: Number(item.allowance_value),
          allowance_name: item.allowance_name || "",
        }));

        const baseParams: IMutateEmployeeRequests = {
          ...restValues,
          role_id: Number(values.role_id) || 0,
          department_id: Number(values.department_id) || 0,
          job_level_id: Number(values.job_level_id) || 0,
          job_position_id: Number(values.job_position_id) || 0,
          phone_number: Number(values.phone_number) || 0,
          bank_id: Number(values.bank_id) || 0,
          date_of_birth: dayjs(values.date_of_birth).format("YYYY-MM-DD"),
          start_date: dayjs(values.start_date).format("YYYY-MM-DD"),
          allowances: validAllowances,
          attachments: attachments || [],
          branch_id: Number(values.branch_id),
          country_code: values.country_code || "",
        };

        const conditionalParams: Partial<IMutateEmployeeRequests> = {
          team_id: values.team_member ? Number(values.team_member) : undefined,
        };

        if (hasValidSocialMediaAccounts(validSocialMedia)) {
          conditionalParams.social_media_accounts = validSocialMedia;
        }

        if (values.photo_profile && values.photo_profile.trim() !== "") {
          conditionalParams.photo_profile = values.photo_profile;
        }

        if (families && families.length > 0) {
          const validFamilies = filterValidData(families, [
            "name",
            "relationship",
          ]);
          if (validFamilies.length > 0) {
            conditionalParams.families = validFamilies;
          }
        }

        if (educations && educations.length > 0) {
          const validEducations = filterValidData(educations, [
            "institution",
            "degree",
          ]);
          if (validEducations.length > 0) {
            conditionalParams.educations = validEducations;
          }
        }

        if (work_experiences && work_experiences.length > 0) {
          const validWorkExperiences = filterValidData(work_experiences, [
            "company",
            "position",
          ]);
          if (validWorkExperiences.length > 0) {
            conditionalParams.work_experiences = validWorkExperiences;
          }
        }

        if (contact_refferences && contact_refferences.length > 0) {
          const validContacts = filterValidData(contact_refferences, [
            "name",
            "phone",
          ]);
          if (validContacts.length > 0) {
            conditionalParams.contact_refferences = validContacts;
          }
        }

        if (
          values.primary_direct_report_id &&
          values.primary_direct_report_id !== 0
        ) {
          conditionalParams.primary_direct_report_id = Number(
            values.primary_direct_report_id,
          );
        }

        if (
          values.additional_direct_report_id &&
          values.additional_direct_report_id > 0 &&
          values.additional_direct_report_id !== null
        ) {
          conditionalParams.additional_direct_report_id = Number(
            values.additional_direct_report_id,
          );
        }

        if (values.end_date) {
          conditionalParams.end_date = dayjs(values.end_date).format(
            "YYYY-MM-DD",
          );
        }

        const finalParams = { ...baseParams, ...conditionalParams };

        editEmployee(finalParams);
      } catch (err) {
        console.error("Error in onSubmit:", err);
        toast.error("Failed to prepare form data for submission");
      }
    },
    [editEmployee, filterValidData, hasValidSocialMediaAccounts],
  );

  React.useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (
        name === "primary_direct_report_id" &&
        value.primary_direct_report_id
      ) {
        const numValue = Number(value.primary_direct_report_id);
        if (numValue !== value.primary_direct_report_id) {
          form.setValue("primary_direct_report_id", numValue);
        }
      }

      if (
        name === "additional_direct_report_id" &&
        value.additional_direct_report_id !== null &&
        value.additional_direct_report_id !== undefined
      ) {
        const numValue = Number(value.additional_direct_report_id);
        if (numValue === 0 || isNaN(numValue)) {
          form.setValue("additional_direct_report_id", null);
        } else if (
          numValue > 0 &&
          numValue !== value.additional_direct_report_id
        ) {
          form.setValue("additional_direct_report_id", numValue);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [form]);

  const handleUpdateEmployee = React.useCallback(async () => {
    const isValid = await form.trigger();
    const formData = form.getValues();

    console.log("# ERROR EDIT ", form.formState.errors);
    if (!isValid) {
      return;
    }
    onSubmit(formData);
  }, [form, onSubmit]);

  if (
    isLoading ||
    isPendingEditEmployee ||
    isPendingArchieveEmployee ||
    !isDataLoaded
  ) {
    return <AppSkeleton />;
  }

  return (
    <React.Fragment>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <PersonalInformationSection />
          <EmployeeinformationSection />
          <SalaryInformationSection />
          <BankInformationSection />
          <AttachmentsSection
            employee_documents={employeeDetails?.employee_documents}
          />

          <div className="flex flex-col md:flex-row justify-between items-center pt-6 border-t">
            <div className="flex gap-2 my-8 justify-between md:justify-start w-full">
              <Button
                type="button"
                variant="outline"
                className="md:max-w-36 w-[50%]"
                onClick={() => router.push("/employee/employee-management")}
                disabled={isPendingEditEmployee}
              >
                Cancel
              </Button>
              <EmployeeUpdateModal
                onUpdate={handleUpdateEmployee}
                disabled={isPendingEditEmployee}
              />
            </div>
            <ArchieveEmployeeModal
              onArchieve={archieveEmployee}
              disabled={isPendingArchieveEmployee}
            />
          </div>
        </form>
      </Form>
    </React.Fragment>
  );
});
