"use client";

import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { IEmployee } from "@/lib/types";
import { ArrowDown, Ellipsis } from "lucide-react";
import * as React from "react";

interface Props {
  data: IEmployee[];
}

export const EmployeeListTable = React.memo(function EmployeeListTable({
  data,
}: Props) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="flex items-center gap-1">
            Name <ArrowDown className="text-text-disabled w-4 h-5" />
          </TableHead>
          <TableHead>Position</TableHead>
          <TableHead>Department</TableHead>
          <TableHead>Contact</TableHead>
          <TableHead className="flex items-center gap-1">
            Status <ArrowDown className="text-text-disabled w-4 h-5" />
          </TableHead>
          <TableHead>Joined</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item) => (
          <TableRow key={item.employeeId}>
            <TableCell>
              <div className="flex gap-2 items-center">
                <Avatar>
                  <AvatarImage src={item.image} />
                </Avatar>
                <div className="flex flex-col">
                  <span>
                    {item.firstName} {item.firstName}
                  </span>
                  <span>{item.employeeId}</span>
                </div>
              </div>
            </TableCell>
            <TableCell>{item.position}</TableCell>
            <TableCell>{item.department}</TableCell>
            <TableCell>
              <div className="flex flex-col">
                <span>{item.email}</span>
                <span>{item.phoneNo}</span>
              </div>
            </TableCell>
            <TableCell>
              {item.status === "active" ? (
                <Badge
                  variant="default"
                  className="bg-success-focused rounded-full"
                >
                  <div className="size-2 rounded-full bg-success" />
                  <span className="text-success">Active</span>
                </Badge>
              ) : (
                <Badge
                  variant="default"
                  className="bg-error-focused rounded-full"
                >
                  <div className="size-2 rounded-full bg-error" />
                  <span className="text-error">Inactive</span>
                </Badge>
              )}
            </TableCell>
            <TableCell>{item.joinDate}</TableCell>
            <TableCell>
              <Button variant="ghost">
                <Ellipsis />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
});
