"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { deleteForm, getAllForm } from "@/services/form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useSelfAssessment() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [openDelete, setOpenDelete] = React.useState(false);
  const [selectedId, setSelectedId] = React.useState<string>("");

  const { data, isLoading: loading } = useQuery({
    queryKey: ["self-assessments"],
    queryFn: getAllForm,
  });

  const { mutate: removeForm } = useMutation({
    mutationFn: (id: number) => deleteForm(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["self-assessments"] });
      toast.success("Success delete self assessment");
      setOpenDelete(false);
    },
    onError: () => {
      toast.error("Failed delete self assessment");
    },
  });

  const handleNew = () => {
    router.push("/performance/self-assessment/add");
  };

  const handleEdit = (id: number | string) => {
    router.push(`/performance/self-assessment/${id}`);
  };

  const handleDelete = () => {
    if (!selectedId) return;
    removeForm(Number(selectedId));
  };

  return {
    forms: data?.data,
    loading,
    handleNew,
    handleEdit,
    openDelete,
    setOpenDelete,
    handleDelete,
    setSelectedId,
  };
}
