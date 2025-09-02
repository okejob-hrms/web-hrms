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
import { FamilyInformationSection } from "../sections/family-information-section";
import { FormalEducationSection } from "../sections/formal-education-section";
import { NonFormalEducationSection } from "../sections/non-formal-education-section";
import { WorkExperienceSection } from "../sections/work-experience-section";
import { ContactOfReferenceSection } from "../sections/contact-reference-section";
import { AttachmentsSection } from "../sections/attachments-section";
import { Button } from "../../../ui/button";
import {
  employeeManagementFormDefaultValues,
  employeeManagementFormScheme,
} from "../types";
import { IMutateEmployeeRequests } from "@/services/employees/types";
import dayjs from "dayjs";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  updateEmployee,
  getEmployeeDetail,
  deleteEmployee,
} from "@/services/employees";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import EmployeeUpdateModal from "../sections/edit-modal";
import EmployeeArchieveModal from "../sections/archieve-modal";
import AppSkeleton from "@/components/partials/app-skeleton";

interface Props {
  employee_profile_id: number;
}

export const EditEmployeeForm = React.memo(function EditEmployee({
  employee_profile_id,
}: Props) {
  const router = useRouter();
  const [isDataLoaded, setIsDataLoaded] = React.useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["employee-detail", employee_profile_id],
    queryFn: () => getEmployeeDetail(employee_profile_id),
  });
  const employeeDetails = data?.data;

  const { mutate: editEmployee, isPending: isPendingEditEmployee } =
    useMutation({
      mutationFn: (params: IMutateEmployeeRequests) =>
        updateEmployee(params, employee_profile_id),
      onSuccess: () => {
        toast.success("Edit employee successfully!");
        router.push("/employee/employee-management");
      },
      onError: (error: any) => {
        toast.error(
          `Failed to edit employee: ${error.message || "Unknown error"}`,
        );
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
    resolver: zodResolver(employeeManagementFormScheme),
    defaultValues: employeeManagementFormDefaultValues,
    mode: "onChange",
  });

  React.useEffect(() => {
    if (employeeDetails && !isDataLoaded) {
      const primaryDirectReports =
        employeeDetails.reporting_relationships
          ?.filter((report) => report.relationship_type === "primary")
          .map((report) => report.employee_profile_id) || [];

      const secondaryDirectReports =
        employeeDetails.reporting_relationships
          ?.filter((report) => report.relationship_type === "secondary")
          .map((report) => report.employee_profile_id) || [];

      const formValues = {
        ...employeeDetails,
        name: employeeDetails.user?.name || "",
        email: employeeDetails.user?.email || "",
        date_of_birth: employeeDetails.date_of_birth
          ? new Date(employeeDetails.date_of_birth)
          : new Date(),
        blood_type: employeeDetails.blood_type || "",
        start_date: employeeDetails.employment?.start_date
          ? new Date(employeeDetails.employment.start_date)
          : new Date(),
        end_date: employeeDetails.employment?.end_date
          ? new Date(employeeDetails.employment.end_date)
          : new Date(),
        role_id: employeeDetails.employment?.job_level_id?.toString() || "",
        marital_status: employeeDetails.marital_status?.toString() || "",
        height: Number(employeeDetails.height) || 0,
        weight: Number(employeeDetails.weight) || 0,
        job_position_id:
          employeeDetails.employment?.job_position_id?.toString() || "",
        department_id:
          employeeDetails.employment?.job_position_id?.toString() || "",
        job_level_id:
          employeeDetails.employment?.job_level_id?.toString() || "",
        bank_id: employeeDetails.bank_account?.bank_id?.toString() || "",
        salary_nett: Number(employeeDetails.employment?.salary_nett) || 0,
        base_salary: Number(employeeDetails.employment?.base_salary) || 0,
        team_members:
          employeeDetails.team_members?.[0]?.team_id?.toString() || "",
        allowances: employeeDetails.employment.allowances.map((item) => ({
          allowance_type_id: item.allowance_type_id.toString(),
          allowance_value: Number(item.allowance_value),
        })),
        status: employeeDetails.employment?.status?.toString() || "",
        direct_reports: [
          {
            relationship_type: "primary" as "primary" | "secondary",
            direct_report_id: primaryDirectReports,
          },
          {
            relationship_type: "secondary" as "primary" | "secondary",
            direct_report_id: secondaryDirectReports,
          },
        ],
        account_number:
          employeeDetails.bank_account?.account_number?.toString() || "",
        account_name: employeeDetails.bank_account?.account_name || "",
        ...(employeeDetails.employee_documents && {
          attachments: employeeDetails.employee_documents?.map((item) => ({
            path: item.path,
            type: item.type,
          })),
        }),
      };

      setTimeout(() => {
        form.reset(formValues);
        setIsDataLoaded(true);
      }, 0);
    }
  }, [employeeDetails, isDataLoaded, form]);

  const onSubmit = (values: z.infer<typeof employeeManagementFormScheme>) => {
    try {
      const { countryCode: _, ...restValues } = values;
      const filteredSocialMedia = values.social_media_accounts?.filter(
        (account) => account.type?.trim() !== "" && account.url?.trim() !== "",
      );
      const filteredDirectReports = values.direct_reports?.flatMap((item) =>
        (item.direct_report_id || []).map((subItem: number) => ({
          direct_report_id: subItem,
          relationship_type: item.relationship_type as "primary" | "secondary",
        })),
      );
      const params: IMutateEmployeeRequests = {
        ...restValues,
        role_id: Number(values.role_id),
        department_id: Number(values.department_id),
        job_level_id: Number(values.job_level_id),
        job_position_id: Number(values.job_position_id),
        social_media_accounts: filteredSocialMedia,
        team_members: [{ team_id: Number(values.team_members) }],
        date_of_birth: dayjs(values.date_of_birth).format("YYYY-MM-DD"),
        start_date: dayjs(values.start_date).format("YYYY-MM-DD"),
        end_date: dayjs(values.end_date).format("YYYY-MM-DD"),
        direct_reports: filteredDirectReports,
        allowances: (values.allowances || []).map((item) => ({
          allowance_type_id: Number(item.allowance_type_id),
          allowance_value: Number(item.allowance_value),
        })),
        phone_number: Number(values.phone_number),
        bank_id: Number(values.bank_id),
        ...(values.photo_profile && { photo_profile: values.photo_profile }),
      };
      editEmployee(params);
    } catch (err) {
      console.log("Error submit", err);
    }
  };

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
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <PersonalInformationSection />
          <EmployeeinformationSection />
          <SalaryInformationSection />
          <BankInformationSection />
          <FamilyInformationSection
            withAddButton
            employee_profile_id={
              employeeDetails?.employment?.employee_profile_id
            }
          />
          <FormalEducationSection
            withAddButton
            employee_profile_id={
              employeeDetails?.employment?.employee_profile_id
            }
          />
          <NonFormalEducationSection
            withAddButton
            employee_profile_id={
              employeeDetails?.employment?.employee_profile_id
            }
          />
          <WorkExperienceSection
            withAddButton
            employee_profile_id={
              employeeDetails?.employment?.employee_profile_id
            }
          />
          <ContactOfReferenceSection
            withAddButton
            employee_profile_id={
              employeeDetails?.employment?.employee_profile_id
            }
          />
          <AttachmentsSection
            employee_documents={employeeDetails?.employee_documents}
          />
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex gap-2 my-8 justify-between md:justify-start w-full">
              <Button
                type="button"
                variant="outline"
                className="md:max-w-36 w-[50%]"
                onClick={() => router.push("/employee/employee-management")}
              >
                Cancel
              </Button>
              <EmployeeUpdateModal onUpdate={form.handleSubmit(onSubmit)} />
            </div>
            <EmployeeArchieveModal onArchieve={() => archieveEmployee()} />
          </div>
        </form>
      </Form>
    </React.Fragment>
  );
});
