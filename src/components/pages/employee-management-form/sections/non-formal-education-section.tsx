"use client";

import { DataTable } from "@/components/tables/data-table";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import * as React from "react";
import { INonFormalEducation } from "@/lib/types";
import { Separator } from "@/components/ui/separator";

export const columns: ColumnDef<INonFormalEducation>[] = [
  {
    accessorKey: "instution",
    header: "Institution",
  },
  {
    accessorKey: "location",
    header: "Location",
  },
  {
    accessorKey: "notes",
    header: "Notes",
  },
  {
    accessorKey: "startDate",
    header: "Start Date",
  },
  {
    accessorKey: "graduateDate",
    header: "Graduate Date",
  },
];

const data: INonFormalEducation[] = [
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

export const NonFormalEducationSection = React.memo(
  function NonFormalEducationSection() {
    return (
      <React.Fragment>
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-lg leading-5 mb-3">
            Non Formal Education
          </h2>
          <Button>
            <Plus /> Add Non Formal Education
          </Button>
        </div>
        <DataTable
          columns={columns}
          data={data}
          tableClassName="table-fixed w-full"
          tableCellClassName="w-1/9 text-clip text-balance"
          tableHeadClassName="w-1/9 text-clip text-balance"
        />
        <Separator className="my-6" />
      </React.Fragment>
    );
  },
);
