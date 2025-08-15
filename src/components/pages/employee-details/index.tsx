"use client";

import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Icon } from "@/components/ui/icon";
import { PersonalInformationDetail } from "./sections/personal-information";
import { mockEmployeeDetail } from "./mock";
import { DocumentDetail } from "./sections/document";
import { PayrollDetail } from "./sections/payroll";
// interface EmployeeDetailTabProps {

// }

const tabs = [
  {
    name: "Personal Information",
    value: "personal-information",
    content: <PersonalInformationDetail />,
    icon: <Icon name="userSolid" size={18} color="currentColor" />,
  },
  {
    name: "Document",
    value: "document",
    content: <DocumentDetail />,
    icon: <Icon name="documentOutlined" size={18} color="currentColor" />,
  },
  {
    name: "Payroll",
    value: "payroll",
    content: <PayrollDetail />,
    icon: <Icon name="debit" size={18} color="currentColor" />,
  },
  {
    name: "Attendance",
    value: "attendance",
    content: "bunx --bun shadcn@latest add tabs",
    icon: <Icon name="clock" size={18} color="currentColor" />,
  },
  {
    name: "Assets",
    value: "assets",
    content: "bunx --bun shadcn@latest add tabs",
    icon: <Icon name="inventory" size={18} color="currentColor" />,
  },
];

export function Tab() {
  return (
    <Tabs defaultValue={tabs[0].value} className="w-full mx-auto">
      <TabsList className="p-1 w-full bg-secondary-background min-h-12">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className={cn(
              "px-2.5 sm:px-3 text-secondary-hover",
              "data-[state=active]:bg-secondary data-[state=active]:text-white",
            )}
          >
            <code className="flex items-center gap-1 text-[13px] [&>svg]:h-4 [&>svg]:w-4">
              {tab.icon} {tab.name}
            </code>
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value}>
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}

export const EmployeeDetail = React.memo(function EmployeeDetail() {
  const data = mockEmployeeDetail;
  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex flex-col items-center">
        <Avatar className="size-20">
          <AvatarImage className="size-20" src={data.photo} alt="@shadcn" />
          <AvatarFallback className="size-10">CN</AvatarFallback>
        </Avatar>
        <h3 className="text-lg font-semibold">{data.name}</h3>
        <p className="text-sm">
          Employee ID <span className="font-semibold">{data.employeeId}</span>
        </p>
        <Badge
          variant="default"
          className={cn(
            "rounded-full",
            data.status === "active"
              ? "bg-success-focused "
              : "bg-error-focused ",
          )}
        >
          <div
            className={cn(
              "size-2 rounded-full",
              data.status === "active" ? "bg-success" : "bg-error",
            )}
          />
          <span
            className={cn(
              data.status === "active" ? "text-success" : "text-error",
            )}
          >
            {data.status === "active" ? "Active" : "Inactive"}
          </span>
        </Badge>
      </div>
      <Tab />
    </div>
  );
});
