"use client";

import { DataTable } from "@/components/tables/data-table";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import * as React from "react";
import { IContactOfReference } from "@/lib/types";
import { Separator } from "@/components/ui/separator";

export const columns: ColumnDef<IContactOfReference>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "relationship",
    header: "Relationship",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "phoneNumber",
    header: "Phone Number",
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

const data: IContactOfReference[] = [];

export const ContactOfReferenceSection = React.memo(
  function ContactOfReferenceSection() {
    return (
      <React.Fragment>
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-lg leading-5 mb-3">
            Contact Reference
          </h2>
          <Button>
            <Plus /> Add Contact Reference
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
