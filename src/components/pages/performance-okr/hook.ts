import * as React from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createOKRCycle, getOKRCycles } from "@/services/okr";
import { toast } from "sonner";
import { ApiErrorResponse } from "@/lib/types";
import { IOKRCycleRequest } from "@/services/okr/types";

export default function useOKR() {
  const router = useRouter();
  const queryClient = useQueryClient();
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

  const createMutation = useMutation({
    mutationFn: createOKRCycle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["okr-cycles"] });
      setOpenForm(false);
      toast.success("OKR cycle created successfully");
    },
    onError: (error: any) => {
      if (error?.response) {
        try {
          error.response
            .json()
            .then((errorData: ApiErrorResponse) => {
              toast.error(errorData.message || "Failed to create OKR cycle");
            })
            .catch(() => {
              toast.error("Failed to create OKR cycle: Server error");
            });
        } catch (parseError) {
          toast.error("Failed to create OKR cycle: Server error");
        }
      } else {
        toast.error(
          `Failed to create OKR cycle: ${error.message || "Unknown error"}`,
        );
      }
    },
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

  const handleSave = (data: IOKRCycleRequest) => {
    createMutation.mutate(data);
  };

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
