"use client";

import { getBranchDetails } from "@/services/settings";
import { useQuery } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import * as React from "react";

export const useCompanyBranchDetails = () => {
  const pathname = usePathname();

  const id = React.useMemo(() => {
    const segments = pathname.split("/");
    const idSegment = segments[segments.length - 1];
    return idSegment && !isNaN(Number(idSegment)) ? Number(idSegment) : null;
  }, [pathname]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["branch-details", id],
    queryFn: () => getBranchDetails(id!),
    enabled: id !== null,
  });

  return {
    data: data?.data,
    isLoading,
    isError,
  };
};
