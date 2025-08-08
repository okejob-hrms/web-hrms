"use client";

import { DataTable } from "@/components/tables/data-table";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import * as React from "react";
import { IFamily } from "@/lib/types";

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

const familyData: IFamily[] = [
  // {
  //   name: "Rina Dewi",
  //   relationship: "Spouse",
  //   placeOfBirth: "Bandung",
  //   bornDate: "1988-05-22",
  //   education: "Bachelor",
  //   email: "rina@example.com",
  //   phoneNumber: "081234567890",
  //   occupation: "Doctor",
  //   company: "RS Harapan Bunda",
  // },
  // {
  //   name: "Arka Pratama",
  //   relationship: "Son",
  //   placeOfBirth: "Jakarta",
  //   bornDate: "2015-11-03",
  //   education: "Elementary",
  //   email: "arka@example.com",
  //   phoneNumber: "081234567891",
  //   occupation: "Student",
  //   company: "-",
  // },
];

export const FamilyInformationSection = React.memo(
  function FamilyInformationSection() {
    return (
      <React.Fragment>
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-lg leading-5 mb-3">
            Family Information
          </h2>
          <Button>
            <Plus /> Add Family Information
          </Button>
        </div>
        <DataTable
          columns={columns}
          data={familyData}
          tableClassName="table-fixed w-full"
          tableCellClassName="w-1/9 text-clip text-balance"
          tableHeadClassName="w-1/9 text-clip text-balance"
        />
      </React.Fragment>
    );
  },
);
