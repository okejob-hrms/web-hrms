import * as React from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getOKRCycles } from "@/services/okr";

export default function useOKR() {
  const router = useRouter();
  const [openForm, setOpenForm] = React.useState(false);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const { data } = useQuery({
    queryKey: ["okr-cycles", pagination],
    queryFn: () => getOKRCycles(),
    enabled: true,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: 5 * 60 * 1000,
  });

  const handleNew = () => {
    setOpenForm(true);
  };

  const handleDetail = (id: number) => {
    router.push(`/performance/okr/${id}`);
  };

  const periodOptions = [
    { label: "Q1", value: "Q1" },
    { label: "Q2", value: "Q2" },
    { label: "Q3", value: "Q3" },
    { label: "Q4", value: "Q4" },
  ];

  const handleCloseForm = () => {
    setOpenForm(false);
  };

  const handleSave = () => {};

  return {
    data: data?.data,
    pagination: data?.pagination,
    paginationState: pagination,
    setPagination,
    openForm,
    setOpenForm,
    handleNew,
    handleDetail,
    periodOptions,
    handleCloseForm,
    handleSave,
  };
}
