"use client";

import { DataTable } from "@/components/tables/data-table";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import * as React from "react";
import { IFormalEducation } from "@/lib/types";
import { Separator } from "@/components/ui/separator";

export const columns: ColumnDef<IFormalEducation>[] = [
  {
    accessorKey: "school",
    header: "School",
  },
  {
    accessorKey: "major",
    header: "Major",
  },
  {
    accessorKey: "city",
    header: "City",
  },
  {
    accessorKey: "startDate",
    header: "Education Start Date",
  },
  {
    accessorKey: "graduationDate",
    header: "Graduation Date",
  },
  {
    accessorKey: "gpa",
    header: "GPA",
  },
];

const data: IFormalEducation[] = [
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
      Formal Education
    </h2>
    {withAddButton && (
      <Button>
        <Plus /> Add Formal Education
      </Button>
    )}
  </div>
);

export const FormalEducationSection = React.memo<Props>(
  function FormalEducationSection({ withAddButton = false }) {
    return (
      <React.Fragment>
        <SectionHeader withAddButton={withAddButton} />
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
