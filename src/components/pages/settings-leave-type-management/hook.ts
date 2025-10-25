import * as React from "react";
import { useRouter } from "next/navigation";
import { Filters } from "./types";

export const useLeaveTypeManagement = () => {
  const router = useRouter();

  const tabs = [
    {
      name: "Leave Type",
      value: "leave-type",
    },
    {
      name: "Leave Balance",
      value: "leave-balance",
    },
  ];

  return {
    tabs,
  };
};
