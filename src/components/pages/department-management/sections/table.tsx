"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowDown, Ellipsis, Edit3, Trash2 } from "lucide-react";
import * as React from "react";
import { IDepartment } from "@/lib/types";

interface Props {
  data: IDepartment[];
  onEdit: (item: IDepartment) => void;
  onDelete: (item: IDepartment) => void;
}

export const DepartmentListTable = React.memo(function DepartmentListTable({
  data,
  onEdit,
  onDelete,
}: Props) {
  const [openMenuId, setOpenMenuId] = React.useState<number | null>(null);

  return (
    <div className="w-full overflow-x-auto">
      <Table className="min-w-[800px] table-fixed">
        <TableHeader>
          <TableRow>
            <TableHead className="pl-6 w-[40%] break-words">
              Department Name
            </TableHead>
            <TableHead className="w-[38%] break-words">Description</TableHead>
            <TableHead className="w-[15%] break-words flex items-center gap-1">
              Last Update <ArrowDown className="text-text-disabled w-4 h-5" />
            </TableHead>
            <TableHead className="w-[7%] pr-6"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow key={item.departmentId}>
              <TableCell className="pl-6 w-[40%] break-words whitespace-normal">
                {item.departmentName}
              </TableCell>
              <TableCell className="w-[38%] break-words whitespace-normal">
                {item.description ?? "-"}
              </TableCell>
              <TableCell className="w-[20%] break-words whitespace-normal">
                <div>
                  <span>{item.lastUpdateDate}</span>
                  <br />
                  <span>{item.lastUpdateHour}</span>
                </div>
              </TableCell>
              <TableCell className="w-[7%]">
                <div className="relative">
                  <Button
                    variant="ghost"
                    onClick={() =>
                      setOpenMenuId(
                        openMenuId === item.departmentId
                          ? null
                          : item.departmentId,
                      )
                    }
                  >
                    <Ellipsis />
                  </Button>

                  {openMenuId === item.departmentId && (
                    <div className="z-1000 absolute top-8 right-0 bg-white rounded-lg shadow-lg border border-gray-200 py-2 w-32 z-50">
                      <button
                        className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-100"
                        onClick={() => {
                          onEdit(item);
                          setOpenMenuId(null);
                        }}
                      >
                        <Edit3 className="w-4 h-4" /> Edit
                      </button>
                      <button
                        className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-100"
                        onClick={() => {
                          onDelete(item);
                          setOpenMenuId(null);
                        }}
                      >
                        <Trash2 className="w-4 h-4" /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
});
