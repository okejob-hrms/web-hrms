"use client";

import { Form } from "@/components/ui/form";
import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { EmployeeinformationSection } from "./sections/employee-information-section";
import { PersonalInformationSection } from "./sections/personal-information-section";
import { SalaryInformationSection } from "./sections/salary-information-section";
import { BankInformationSection } from "./sections/bank-information-section";
import { FamilyInformationSection } from "./sections/family-information-section";
import { FormalEducationSection } from "./sections/formal-education-section";
import { NonFormalEducationSection } from "./sections/non-formal-education-section";
import { WorkExperienceSection } from "./sections/work-experience-section";
import { ContactOfReferenceSection } from "./sections/contact-reference-section";
import { AttachmentsSection } from "./sections/attachments-section";
import { Button } from "../../ui/button";
import { employeeManagementFormScheme } from "./types";

export const AddEmployeeForm = React.memo(function AddEmployee() {
  const form = useForm<z.infer<typeof employeeManagementFormScheme>>({
    resolver: zodResolver(employeeManagementFormScheme),
  });

  const onSubmit = (values: z.infer<typeof employeeManagementFormScheme>) => {
    console.log(values);
  };
  return (
    <React.Fragment>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="p-8">
          <PersonalInformationSection />
          <EmployeeinformationSection />
          <SalaryInformationSection />
          <BankInformationSection />
          <FamilyInformationSection />
          <FormalEducationSection />
          <NonFormalEducationSection />
          <WorkExperienceSection />
          <ContactOfReferenceSection />
          <AttachmentsSection />
          <div className="flex gap-2 my-8">
            <Button variant="outline" className="min-w-36">
              Cancel
            </Button>
            <Button className="min-w-36">Add Employee</Button>
          </div>
        </form>
      </Form>
    </React.Fragment>
  );
});
