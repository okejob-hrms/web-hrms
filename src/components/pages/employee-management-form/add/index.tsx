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
import { useMutation } from "@tanstack/react-query";
import { createEmployee } from "@/services/employees";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { convertPhoneToNumber } from "@/lib/helpers";

export const AddEmployeeForm = React.memo(function AddEmployee() {
  const router = useRouter();
  const { mutate, isPending } = useMutation({
    mutationFn: (params: IMutateEmployeeRequests) => createEmployee(params),
    onSuccess: () => {
      toast.success("Employee added successfully!");
      router.push("/employee/employee-management");
      form.reset();
    },
    onError: (error: any) => {
      toast.error(
        `Failed to add employee: ${error.message || "Unknown error"}`,
      );
    },
  });
  const form = useForm<z.infer<typeof employeeManagementFormScheme>>({
    // resolver: zodResolver(employeeManagementFormScheme),
    defaultValues: employeeManagementFormDefaultValues,
  });

  const onSubmit = (values: z.infer<typeof employeeManagementFormScheme>) => {
    try {
      const {
        countryCode: _,
        additional_direct_report_id,
        ...restValues
      } = values;
      const filteredSocialMedia = values.social_media_accounts?.filter(
        (account) => account?.type.trim() !== "" && account?.url.trim() !== "",
      );

      const params: IMutateEmployeeRequests = {
        ...restValues,
        role_id: Number(values.role_id),
        department_id: Number(values.department_id),
        job_level_id: Number(values.job_level_id),
        job_position_id: Number(values.job_position_id),
        ...(filteredSocialMedia && {
          social_media_accounts: filteredSocialMedia,
        }),
        team_members: [{ team_id: Number(values.team_members) }],
        date_of_birth: dayjs(values.date_of_birth).format("YYYY-MM-DD"),
        start_date: dayjs(values.start_date).format("YYYY-MM-DD"),
        end_date: dayjs(values.end_date).format("YYYY-MM-DD"),
        allowances: values.allowances.map((item) => ({
          allowance_type_id: Number(item.allowance_type_id),
          allowance_value: Number(item.allowance_value),
        })),
        phone_number: Number(convertPhoneToNumber(values.phone_number)),
        bank_id: Number(values.bank_id),
        work_experiences: values.work_experiences?.filter((item) => item.id),
        contact_refferences: values.contact_refferences?.filter(
          (item) => item.id,
        ),
        families: values.families?.filter((item) => item.id),
        educations: values.educations?.filter((item) => item.id),
        ...(values.primary_direct_report_id !== 0 && {
          primary_direct_report_id: Number(values.primary_direct_report_id),
        }),
        ...(values.additional_direct_report_id !== 0 && {
          additional_direct_report_id: Number(
            values.additional_direct_report_id,
          ),
        }),
      };
      console.log(params);
      mutate(params);
    } catch (err) {
      console.log("Error submit", err);
    }
  };

  React.useEffect(() => {
    console.log("# ERRORS ", form.formState.errors);
  }, [form.formState.errors]);

  return (
    <React.Fragment>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <PersonalInformationSection />
          <EmployeeinformationSection />
          <SalaryInformationSection />
          <BankInformationSection />
          <FamilyInformationSection withAddButton />
          <FormalEducationSection withAddButton />
          <NonFormalEducationSection withAddButton />
          <WorkExperienceSection withAddButton />
          <ContactOfReferenceSection withAddButton />
          <AttachmentsSection />
          <div className="flex gap-2 my-8 justify-between md:justify-start w-full">
            <Button
              variant="outline"
              className="md:max-w-36 w-[50%]"
              isLoading={isPending}
            >
              Cancel
            </Button>
            <Button className="md:max-w-36 w-[50%]">Add Employee</Button>
          </div>
        </form>
      </Form>
    </React.Fragment>
  );
});
