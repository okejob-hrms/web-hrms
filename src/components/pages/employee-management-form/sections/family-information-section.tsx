"use client";

import { DataTable } from "@/components/tables/data-table";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import * as React from "react";
import { IFamily } from "@/lib/types";

// Utility functions
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// Column definitions
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
    cell: ({ row }) => <span>{formatDate(row.getValue("bornDate"))}</span>,
  },
  {
    accessorKey: "education",
    header: "Highest Education Level",
  },
  {
    accessorKey: "email",
    header: "Email",
    // cell: ({ row }) => createContactLink("email", row.getValue("email")),
  },
  {
    accessorKey: "phoneNumber",
    header: "Phone",
    // cell: ({ row }) => createContactLink("phone", row.getValue("phoneNumber")),
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

// Mock data
const FAMILY_DATA: IFamily[] = [
  {
    name: "Rina Dewi",
    relationship: "Spouse",
    placeOfBirth: "Bandung",
    bornDate: "1988-05-22",
    education: "Bachelor",
    email: "rina@example.com",
    phoneNumber: "081234567890",
    occupation: "Doctor",
    company: "RS Harapan Bunda",
  },
  {
    name: "Arka Pratama",
    relationship: "Son",
    placeOfBirth: "Jakarta",
    bornDate: "2015-11-03",
    education: "Elementary",
    email: "arka@example.com",
    phoneNumber: "081234567891",
    occupation: "Student",
    company: "-",
  },
];

// Shared styles
const TABLE_CELL_CLASSES =
  "md:w-1/9 md:text-clip md:text-balance whitespace-nowrap";

interface Props {
  withAddButton?: boolean;
}

const SectionHeader = ({ withAddButton }: Pick<Props, "withAddButton">) => (
  <div
    className={withAddButton ? "flex justify-between items-center mb-4" : ""}
  >
    <h2
      className={`font-semibold text-lg leading-5 ${withAddButton ? "mb-3" : ""}`}
    >
      Family Information
    </h2>
    {withAddButton && (
      <Button>
        <Plus /> Add Family Information
      </Button>
    )}
  </div>
);

export const FamilyInformationSection = React.memo<Props>(
  function FamilyInformationSection({ withAddButton = false }) {
    return (
      <>
        <SectionHeader withAddButton={withAddButton} />
        <DataTable
          columns={columns}
          data={FAMILY_DATA}
          tableClassName="table-fixed w-full"
          tableCellClassName={TABLE_CELL_CLASSES}
          tableHeadClassName={TABLE_CELL_CLASSES}
        />
        <Separator className="my-6" />
      </>
    );
  },
);
