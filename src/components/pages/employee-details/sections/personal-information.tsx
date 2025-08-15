import * as React from "react";
import { mockEmployeeDetail } from "../mock";
import { Separator } from "@/components/ui/separator";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import { rupiahFormatter } from "@/lib/helpers";
import { IFamily } from "@/lib/types";
import { ColumnDef } from "@tanstack/react-table";
import { FamilyInformationSection } from "../../employee-management-form/sections/family-information-section";
import { FormalEducationSection } from "../../employee-management-form/sections/formal-education-section";
import { NonFormalEducationSection } from "../../employee-management-form/sections/non-formal-education-section";
import { WorkExperienceSection } from "../../employee-management-form/sections/work-experience-section";
import { ContactOfReferenceSection } from "../../employee-management-form/sections/contact-reference-section";
dayjs.extend(localizedFormat);

export const columns: ColumnDef<IFamily>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "relationship",
    header: "Family Relationship",
  },
  {
    accessorKey: "placeOfBirth",
    header: "Place of Birth",
  },
  {
    accessorKey: "bornDate",
    header: "Date of Birth",
    cell: ({ row }) => {
      const raw = row.getValue("bornDate") as string;
      const formatted = new Date(raw).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
      return <span>{formatted}</span>;
    },
  },
  {
    accessorKey: "education",
    header: "Highest Education Level",
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => {
      const value = row.getValue("email") as string;
      return (
        <a href={`mailto:${value}`} className="text-blue-600 underline">
          {value}
        </a>
      );
    },
  },
  {
    accessorKey: "phoneNumber",
    header: "Phone",
    cell: ({ row }) => {
      const value = row.getValue("phoneNumber") as string;
      return (
        <a href={`tel:${value}`} className="text-blue-600 underline">
          {value}
        </a>
      );
    },
  },
  {
    accessorKey: "occupation",
    header: "Occupation",
  },
  {
    accessorKey: "company",
    header: "Company",
  },
];

export const PersonalInformationDetail = React.memo(
  function PersonalInformationDetail() {
    const data = mockEmployeeDetail;
    return (
      <div className="flex flex-col w-full gap-4 p-2">
        <div className="grid md:grid-cols-3 grid-cols-1 gap-4">
          <h2 className="font-semibold text-lg md:col-span-3">
            Personal Information
          </h2>
          <div className="flex flex-col">
            <p className="text-sm text-text-disabled">User Role</p>
            <p>{data.role}</p>
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-text-disabled">Email</p>
            <p>{data.email}</p>
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-text-disabled">Phone Number</p>
            <p>{data.phoneNumber}</p>
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-text-disabled">Gender</p>
            <p>{data.gender}</p>
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-text-disabled">Place of Birth</p>
            <p>{data.placeOfBirth}</p>
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-text-disabled">Born Date</p>
            <p>{dayjs(data.bornDate).format("LL")}</p>
          </div>
          <div className="grid grid-cols-2">
            <div className="flex flex-col">
              <p className="text-sm text-text-disabled">Marital Status</p>
              <p>{data.maritalStatus}</p>
            </div>
            <div className="flex flex-col">
              <p className="text-sm text-text-disabled">Blood Type</p>
              <p>{data.bloodType}</p>
            </div>
          </div>
          <div className="grid grid-cols-2">
            <div className="flex flex-col">
              <p className="text-sm text-text-disabled">Height</p>
              <p>{data.height}</p>
            </div>
            <div className="flex flex-col">
              <p className="text-sm text-text-disabled">Weight</p>
              <p>{data.weight}</p>
            </div>
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-text-disabled">ID Number</p>
            <p>{data.idNumber}</p>
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-text-disabled">
              Taxpayer ID Number (NPWP)
            </p>
            <p>{data.npwp}</p>
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-text-disabled">
              Health Insurance Number (BPJS)
            </p>
            <p>{data.bpjs}</p>
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-text-disabled">Hobby</p>
            <p>{data.hobby}</p>
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-text-disabled">Citizen ID Address</p>
            <p>{data.addressCitizen}</p>
          </div>
          <div className="flex flex-col col-start-1">
            <p className="text-sm text-text-disabled">Residental Address</p>
            <p>{data.residentalAddress}</p>
          </div>
          <div className="flex flex-col col-start-1 col-span-3">
            <p className="text-sm text-text-disabled">Achievement</p>
            <p>{data.achievement}</p>
          </div>
          <div className="flex flex-col col-start-1 col-span-3">
            <p className="text-sm text-text-disabled">Personal Description</p>
            <p>{data.personalDescription}</p>
          </div>
          <div className="flex flex-col col-start-1 col-span-3">
            <p className="text-sm text-text-disabled">Social Media</p>
            <p>{data.personalDescription}</p>
          </div>
          <Separator className="md:col-span-3" />
        </div>

        <div className="grid md:grid-cols-3 grid-cols-1 gap-4">
          <h2 className="font-semibold text-lg md:col-span-3">
            Employee Information
          </h2>
          <div className="flex flex-col">
            <p className="text-sm text-text-disabled">Position</p>
            <p>{data.position}</p>
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-text-disabled">Department</p>
            <p>{data.department}</p>
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-text-disabled">Job Level</p>
            <p>{data.jobLevel}</p>
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-text-disabled">Primary Direct Report</p>
            <p>{data.primaryDirectReport}</p>
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-text-disabled">
              Additional Direct Report
            </p>
            <p>{data.additionalDirectReport}</p>
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-text-disabled">Team</p>
            <p>{data.team}</p>
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-text-disabled">Employee Start Date</p>
            <p>{dayjs(data.startDate).format("LL")}</p>
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-text-disabled">Employee End Date</p>
            <p>{dayjs(data.endDate).format("LL")}</p>
          </div>
          <Separator className="md:col-span-3" />
        </div>

        <div className="grid md:grid-cols-3 grid-cols-1 gap-4">
          <h2 className="font-semibold text-lg md:col-span-3">
            Salary Information
          </h2>
          <div className="flex flex-col">
            <p className="text-sm text-text-disabled">Base Salary</p>
            <p>{rupiahFormatter(data.baseSalary)}</p>
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-text-disabled">Salary (Nett)</p>
            <p>{rupiahFormatter(data.nettSalary)}</p>
          </div>
          <Separator className="md:col-span-3" />
        </div>

        <div className="grid md:grid-cols-3 grid-cols-1 gap-4">
          <h2 className="font-semibold text-lg md:col-span-3">
            Bank Information
          </h2>
          <div className="flex flex-col">
            <p className="text-sm text-text-disabled">Bank</p>
            <p>{data.bank}</p>
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-text-disabled">Account Number</p>
            <p>{data.bankAccountNumber}</p>
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-text-disabled">Account Name</p>
            <p>{data.bankAccountName}</p>
          </div>
          <Separator className="md:col-span-3" />
        </div>
        <FamilyInformationSection />
        <FormalEducationSection />
        <NonFormalEducationSection />
        <WorkExperienceSection />
        <ContactOfReferenceSection />
      </div>
    );
  },
);
