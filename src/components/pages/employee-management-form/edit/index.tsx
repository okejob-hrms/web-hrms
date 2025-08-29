// src/components/pages/employee-management-form/edit/index.tsx
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
import Image from "next/image";

interface Props {
  employee_profile_id: number;
}

export const EditEmployeeForm = React.memo(function EditEmployee({
  employee_profile_id,
}: Props) {
  const router = useRouter();
  const { data } = useQuery({
    queryKey: ["employee-detail", employee_profile_id],
    queryFn: () => getEmployeeDetail(employee_profile_id),
  });
  const employeeDetails = data?.data;
  const { mutate: editEmployee } = useMutation({
    mutationFn: (params: IMutateEmployeeRequests) => updateEmployee(params),
    onSuccess: () => {
      toast.success("Edit employee successfully!");
      router.push("/employee/employee-management");
      form.reset();
    },
    onError: (error: any) => {
      toast.error(
        `Failed to edit employee: ${error.message || "Unknown error"}`,
      );
    },
  });
  const { mutate: archieveEmployee } = useMutation({
    mutationFn: () => deleteEmployee(employee_profile_id),
    onSuccess: () => {
      toast.success("Archieve employee successfully!");
      router.push("/employee/employee-management");
      form.reset();
    },
    onError: (error: any) => {
      toast.error(
        `Failed to archieve employee: ${error.message || "Unknown error"}`,
      );
    },
  });
  const form = useForm<z.infer<typeof employeeManagementFormScheme>>({
    resolver: zodResolver(employeeManagementFormScheme),
    defaultValues: employeeManagementFormDefaultValues,
  });

  React.useEffect(() => {
    if (employeeDetails) {
      const primaryDirectReports = employeeDetails.reporting_relationships
        .filter((report) => report.relationship_type === "primary")
        .map((report) => report.employee_profile_id);

      const secondaryDirectReports = employeeDetails.reporting_relationships
        .filter((report) => report.relationship_type === "secondary")
        .map((report) => report.employee_profile_id);
      const formValues = {
        ...employeeDetails,
        name: employeeDetails.user.name,
        email: employeeDetails.user.email,
        date_of_birth: employeeDetails.date_of_birth
          ? new Date(employeeDetails.date_of_birth)
          : new Date(),
        start_date: employeeDetails.employment.start_date
          ? new Date(employeeDetails.employment.start_date)
          : new Date(),
        end_date: employeeDetails.employment.start_date
          ? new Date(employeeDetails.employment.end_date)
          : null,
        role_id: employeeDetails.employment.job_level_id.toString() || "",
        marital_status: employeeDetails.marital_status.toString(),
        height: Number(employeeDetails.height),
        weight: Number(employeeDetails.weight),
        job_position_id: employeeDetails.employment.job_position_id.toString(),
        department_id: employeeDetails.employment.job_position_id.toString(),
        job_level_id: employeeDetails.employment.job_level_id.toString(),
        bank_id: employeeDetails.bank_account.bank_id.toString(),
        salary_nett: Number(employeeDetails.employment.salary_nett),
        base_salary: Number(employeeDetails.employment.base_salary),
        team_members: employeeDetails.team_members[0].team_id.toString(),
        status: employeeDetails.employment.status.toString(),
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
        account_number: employeeDetails.bank_account.account_number.toString(),
        account_name: employeeDetails.bank_account.account_name,
      };

      form.reset(formValues);
    }
  }, [employeeDetails, form]);

  const onSubmit = (values: z.infer<typeof employeeManagementFormScheme>) => {
    try {
      const { countryCode: _, ...restValues } = values;
      const filteredSocialMedia = values.social_media_accounts.filter(
        (account) => account.type.trim() !== "" && account.url.trim() !== "",
      );
      const filteredDirectReports = values.direct_reports.flatMap((item) =>
        item.direct_report_id.map((subItem: number) => ({
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
        allowances: values.allowances.map((item) => ({
          allowance_type_id: Number(item.allowance_type_id),
          allowance_value: Number(item.allowance_value),
        })),
        phone_number: Number(values.phone_number),
        bank_id: Number(values.bank_id),
      };
      editEmployee(params);
    } catch (err) {
      console.log("Error submit", err);
    }
  };

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
              employeeDetails?.employment.employee_profile_id
            }
          />
          <FormalEducationSection
            withAddButton
            employee_profile_id={
              employeeDetails?.employment.employee_profile_id
            }
          />
          <NonFormalEducationSection
            withAddButton
            employee_profile_id={
              employeeDetails?.employment.employee_profile_id
            }
          />
          <WorkExperienceSection
            withAddButton
            employee_profile_id={
              employeeDetails?.employment.employee_profile_id
            }
          />
          <ContactOfReferenceSection
            withAddButton
            employee_profile_id={
              employeeDetails?.employment.employee_profile_id
            }
          />
          <AttachmentsSection
            employee_documents={employeeDetails?.employee_documents}
          />
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex gap-2 my-8 justify-between md:justify-start w-full">
              <Button variant="outline" className="md:max-w-36 w-[50%]">
                Cancel
              </Button>
              <Button className="md:max-w-36 w-[50%]">Update</Button>
            </div>
            <Button
              className="min-w-36 text-error font-semibold text-base"
              variant="ghost"
              onClick={() => archieveEmployee}
            >
              <Image
                src="/icons/deleteOutlined.svg"
                width={20}
                height={20}
                alt="delete"
              />{" "}
              Archieve Employee
            </Button>
          </div>
        </form>
      </Form>
    </React.Fragment>
  );
});
