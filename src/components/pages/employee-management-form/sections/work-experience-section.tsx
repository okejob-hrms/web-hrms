"use client";

import { DataTable } from "@/components/tables/data-table";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import * as React from "react";
import { IWorkExperience } from "@/lib/types";
import { Separator } from "@/components/ui/separator";

export const columns: ColumnDef<IWorkExperience>[] = [
  {
    accessorKey: "company",
    header: "Company",
  },
  {
    accessorKey: "initialPosition",
    header: "Initial Position",
  },
  {
    accessorKey: "finalPosition",
    header: "Final Position",
  },
  {
    accessorKey: "supervision",
    header: "Supervision",
  },
  {
    accessorKey: "supervisorContact",
    header: "Supervisor Contact",
  },
  {
    accessorKey: "companyAddress",
    header: "Company Address",
  },
  {
    accessorKey: "joinDate",
    header: "Join Date",
    cell: ({ getValue }) => {
      const date = getValue<Date>();
      return date ? date.toLocaleDateString() : "";
    },
  },
  {
    accessorKey: "resignDate",
    header: "Resign Date",
    cell: ({ getValue }) => {
      const date = getValue<Date>();
      return date ? date.toLocaleDateString() : "";
    },
  },
  {
    accessorKey: "lastSalary",
    header: "Last Salary",
    cell: ({ getValue }) => {
      const salary = getValue<number>();
      return salary
        ? salary.toLocaleString("en-US", { style: "currency", currency: "USD" })
        : "";
    },
  },
  {
    accessorKey: "reasonOfResign",
    header: "Reason of Resign",
  },
];

const data: IWorkExperience[] = [];

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
      Work Experience
    </h2>
    {withAddButton && (
      <Button>
        <Plus /> Add Work Experience
      </Button>
    )}
  </div>
);

export const WorkExperienceSection = React.memo<Props>(
  function WorkExperienceSection({ withAddButton }) {
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
