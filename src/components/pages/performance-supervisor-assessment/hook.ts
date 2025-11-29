/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  deleteSupervisorAssessment,
  getAllSupervisorAssessment,
} from "@/services/performances/supervisor-assessment";

export function useSupervisorAssessment() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [openDelete, setOpenDelete] = React.useState(false);
  const [openFormModal, setOpenFormModal] = React.useState(false);
  const [selectedId, setSelectedId] = React.useState<string>("");

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["supervisor-assessments"],
    queryFn: () => getAllSupervisorAssessment(),
  });

  const { mutate: removeForm } = useMutation({
    mutationFn: (id: number) => deleteSupervisorAssessment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supervisor-assessments"] });
      toast.success("Success delete supervisor assessment");
      setOpenDelete(false);
    },
    onError: () => {
      toast.error("Failed delete supervisor assessment");
    },
  });

  const handleNew = () => {
    router.push("/performance/supervisor-assessment/add");
  };

  const handleEdit = (id: number | string) => {
    router.push(`/performance/supervisor-assessment/${id}`);
  };

  const handleDelete = () => {
    if (!selectedId) return;
    removeForm(Number(selectedId));
  };

  const handleFormSubmit = (data: any) => {
    console.log(data);
  };

  return {
    handleNew,
    handleEdit,
    openDelete,
    setOpenDelete,
    handleDelete,
    setSelectedId,
    openFormModal,
    setOpenFormModal,
    handleFormSubmit,
    data,
    isLoading,
    isFetching,
  };
}
