"use client";

import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn, stringAvatar } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Icon } from "@/components/ui/icon";
import { PersonalInformationDetail } from "./sections/personal-information";
import { DocumentDetail } from "./sections/document";
import { PayrollDetail } from "./sections/payroll";
import { useQuery } from "@tanstack/react-query";
import { getEmployeeDetail } from "@/services/employees";
import { IEmployeeDetailsResponse } from "@/services/employees/types";
import { AttendanceDetail } from "./sections/attendance";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Clock, Gavel } from "lucide-react";
import { PenaltyDetail } from "./sections/penalty";
import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  id: number;
}

interface TabProps {
  data: IEmployeeDetailsResponse;
}

export function Tab({ data }: TabProps) {
  const t = useTranslations("employee");
  const tabs = [
    {
      name: t("personalInformation"),
      value: "personal-information",
      content: <PersonalInformationDetail data={data} />,
      icon: <Icon name="userSolid" size={18} color="currentColor" />,
    },
    {
      name: t("document"),
      value: "document",
      content: <DocumentDetail userId={data.user_id} />,
      icon: <Icon name="documentOutlined" size={18} color="currentColor" />,
    },
    {
      name: t("payroll"),
      value: "payroll",
      content: <PayrollDetail userId={data.user_id} />,
      icon: <Icon name="debit" size={18} color="currentColor" />,
    },
    {
      name: t("attendance"),
      value: "attendance",
      content: <AttendanceDetail data={data} />,
      icon: <Clock size={18} color="currentColor" />,
    },
    {
      name: t("penalty"),
      value: "penalty",
      content: <PenaltyDetail userId={data.user_id} />,
      icon: <Gavel size={18} color="currentColor" />,
    },
  ];
  return (
    <Tabs defaultValue={tabs[0].value} className="w-full mx-auto">
      <TabsList className="p-1 w-full bg-secondary-background min-h-12 h-9">
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

export const EmployeeDetail = React.memo(function EmployeeDetail({
  id,
}: Props) {
  const router = useRouter();
  const t = useTranslations("employee");
  const tCommon = useTranslations("common");
  const { data: employeeDetails, isLoading, isError } = useQuery({
    queryKey: ["employee-detail", id],
    queryFn: () => getEmployeeDetail(id),
  });
  const data = employeeDetails?.data;

  if (isLoading) {
    return (
      <div className="w-full flex flex-col gap-4 md:px-[125px] px-4 py-8">
        <Skeleton className="h-20 w-20 rounded-full mx-auto" />
        <Skeleton className="h-6 w-48 mx-auto" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="w-full flex flex-col items-center gap-4 md:px-[125px] px-4 py-8">
        <p className="text-text-secondary">{t("failedLoadEmployee")}</p>
        <Button
          variant="outline"
          onClick={() => router.push("/employee/employee-management")}
        >
          {tCommon("goBack")}
        </Button>
      </div>
    );
  }

  if (data) {
    return (
      <div className="w-full flex flex-col gap-4 md:px-[125px] px-4">
        <div className="grid grid-cols-3 items-start">
          <div className="flex flex-col items-center col-start-2">
            <Avatar className="h-20 w-20">
              <AvatarImage
                className="size-20"
                src={`${data.photo_profile_url}`}
                alt={data.user.name}
              />
              <AvatarFallback className="text-base font-medium">
                {stringAvatar(data.user.name)}
              </AvatarFallback>
            </Avatar>
            <h3 className="text-lg font-semibold">{data.user.name}</h3>
            <p className="text-sm">
              {t("employeeId")}{" "}
              <span className="font-semibold">{data.code}</span>
            </p>
            <Badge
              variant="default"
              className={cn(
                "rounded-full",
                data.employment?.status === 1
                  ? "bg-success-focused "
                  : "bg-error-focused ",
              )}
            >
              <div
                className={cn(
                  "size-2 rounded-full",
                  data.employment?.status === 1 ? "bg-success" : "bg-error",
                )}
              />
              <span
                className={cn(
                  data.employment?.status === 1 ? "text-success" : "text-error",
                )}
              >
                {data.employment?.status === 1
                  ? tCommon("active")
                  : tCommon("inactive")}
              </span>
            </Badge>
          </div>
          <Button
            variant="ghost"
            className="text-primary font-semibold text-base w-fit justify-self-end"
            onClick={() =>
              router.push(`/employee/employee-management/edit/${id}`)
            }
          >
            <Image
              src="/icons/editBlue.svg"
              width={24}
              height={24}
              alt="edit"
            />
            {t("editEmployeeData")}
          </Button>
        </div>
        <Tab data={data} />
      </div>
    );
  }
});
