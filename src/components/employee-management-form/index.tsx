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

export const AddEmployeeForm = React.memo(function AddEmployee() {
  const schema = z.object({
    photo: z.string(),
    name: z.string().min(1, "required"),
    email: z.email().min(1, "required"),
    countryCode: z.string().min(1, "required"),
    phoneNumber: z.email().min(1, "required"),
    gender: z.enum(["male", "female"]),
    placeOfBirth: z.string().min(1, "required"),
    bornDate: z.date(),
    maritalStatus: z.enum(["male", "female"]),
    bloodType: z.string().min(1, "required"),
    height: z.number().min(1, "required"),
    weight: z.number().min(1, "required"),
    idNumber: z.string().min(16, "required"),
    npwp: z.string().min(1, "required"),
    bpjs: z.string(),
    addressCitizen: z.string().min(1, "required"),
    residentalAddress: z.string().min(1, "required"),
    hobby: z.string().min(1, "required"),
    achievement: z.string().min(1, "required"),
    personalDescription: z.string().min(1, "required"),
    socialMedia: {
      instagram: z.string(),
      twitter: z.string(),
    },
    socialMediaOption: z.string().min(1, "required"),
    position: z.string().min(1, "required"),
    department: z.string().min(1, "required"),
    jobLevel: z.string().min(1, "required"),
    primaryDirectReport: z.string().min(1, "required"),
    additionalDirectReport: z.string(),
    team: z.string(),
    startDate: z.date().min(1, "required"),
    endDate: z.date().min(1, "required"),
    status: z.string().min(1, "required"),
    baseSalary: z.number().min(1, "required"),
    nettSalary: z.number().min(1, "required"),
    allowanceType: z.string().min(1, "required"),
    allowanceValue: z.number().min(1, "required"),
    bank: z.string().min(1, "required"),
    bankAccountNumber: z.string().min(1, "required"),
    bankAccountName: z.string().min(1, "required"),
    families: {
      name: z.string().min(1, "required"),
      relationship: z.string().min(1, "required"),
      placeOfBirth: z.string().min(1, "required"),
      bornDate: z.date(),
      education: z.string().min(1, "required"),
      email: z.email(),
      phoneNumber: z.string(),
      occupation: z.string(),
      company: z.string(),
    },
    formalEducations: {
      school: z.string().min(1, "required"),
      city: z.string().min(1, "required"),
      major: z.string().min(1, "required"),
      startDate: z.date().min(1, "required"),
      graduateDate: z.date().min(1, "required"),
      gpa: z.number().min(1, "required"),
    },
    nonFormalEducations: {
      school: z.string().min(1, "required"),
      city: z.string().min(1, "required"),
      major: z.string().min(1, "required"),
      startDate: z.date().min(1, "required"),
      graduateDate: z.date().min(1, "required"),
    },
    experiences: {
      company: z.string().min(1, "required"),
      initialPosition: z.string().min(1, "required"),
      finalPosition: z.string().min(1, "required"),
      supervision: z.string().min(1, "required"),
      supervisorContact: z.string().min(1, "required"),
      companyAddress: z.string().min(1, "required"),
      joinDate: z.date().min(1, "required"),
      resignDate: z.date().min(1, "required"),
      lastSalary: z.number().min(1, "required"),
      reasonOfResign: z.string().min(1, "required"),
    },
    contactOfReference: {
      name: z.string().min(1, "required"),
      relationship: z.string().min(1, "required"),
      email: z.email(),
      phoneNumber: z.string(),
      occupation: z.string(),
      company: z.string(),
    },
    attachments: {
      cv: z.string().min(1, "required"),
      idCard: z.string().min(1, "required"),
      bankAccount: z.string().min(1, "required"),
      graduactionCertificate: z.string().min(1, "required"),
      healthInsurance: z.string().min(1, "required"),
      others: z.string().min(1, "required"),
    },
  });

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (values: z.infer<typeof schema>) => {
    console.log(values);
  };
  return (
    <React.Fragment>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <PersonalInformationSection />
          <EmployeeinformationSection />
          <SalaryInformationSection />
          <BankInformationSection />
          <FamilyInformationSection />
        </form>
      </Form>
    </React.Fragment>
  );
});
