/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getPerformanceCompetencies,
  postAddPerformanceCompetency,
  deletePerformanceCompetency,
  updatePerformanceCompetency,
} from "@/services/performance-competency";
import { IMutatePerformanceCompetency } from "@/services/performance-competency/types";
import { toast } from "sonner";
import { useForm } from "react-hook-form";

export const usePerformanceCompetenciesList = () => {
  const queryClient = useQueryClient();
  const form = useForm<IMutatePerformanceCompetency>({
    defaultValues: {
      code: "",
      name: "",
      description: "",
    },
  });
  const [isOpenModalForm, setIsOpenModalForm] = React.useState(false);
  const [isOpenDeleteModal, setIsOpenDeleteModal] = React.useState(false);
  const [selectedId, setSelectedId] = React.useState<number | null>(null);
  const [editingId, setEditingId] = React.useState<number | null>(null);

  const { data: performanceCompetencies } = useQuery({
    queryKey: ["performance-competencies"],
    queryFn: () => getPerformanceCompetencies(),
  });

  const mutateAddPerformanceCompetency = useMutation({
    mutationFn: (params: IMutatePerformanceCompetency) =>
      postAddPerformanceCompetency(params),
    onSuccess: () => {
      setIsOpenModalForm(false);
      setEditingId(null);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["performance-competencies"] });
      toast.success("Performance competency added successfully");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to add performance competency");
    },
  });

  const mutateUpdatePerformanceCompetency = useMutation({
    mutationFn: ({
      id,
      params,
    }: {
      id: number;
      params: IMutatePerformanceCompetency;
    }) => updatePerformanceCompetency(id, params),
    onSuccess: () => {
      setIsOpenModalForm(false);
      setEditingId(null);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["performance-competencies"] });
      toast.success("Performance competency updated successfully");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update performance competency");
    },
  });

  const mutateDeletePerformanceCompetency = useMutation({
    mutationFn: (id: number) => deletePerformanceCompetency(id),
    onSuccess: () => {
      setIsOpenDeleteModal(false);
      setSelectedId(null);
      queryClient.invalidateQueries({ queryKey: ["performance-competencies"] });
      toast.success("Performance competency deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to delete performance competency");
    },
  });

  const handleAddNew = () => {
    form.reset();
    setEditingId(null);
    setIsOpenModalForm(true);
  };

  const handleEditClick = (id: number) => {
    const competency = performanceCompetencies?.data.data.find(
      (item: any) => item.id === id,
    );
    if (competency) {
      form.reset({
        code: competency.code,
        name: competency.name,
        description: competency.description,
      });
      setEditingId(id);
      setIsOpenModalForm(true);
    }
  };

  const handleSave = form.handleSubmit((data: IMutatePerformanceCompetency) => {
    if (editingId !== null) {
      mutateUpdatePerformanceCompetency.mutate({ id: editingId, params: data });
    } else {
      mutateAddPerformanceCompetency.mutate(data);
    }
  });

  const handleDeleteClick = (id: number) => {
    setSelectedId(id);
    setIsOpenDeleteModal(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedId !== null) {
      mutateDeletePerformanceCompetency.mutate(selectedId);
    }
  };

  const handleModalClose = () => {
    setIsOpenModalForm(false);
    setEditingId(null);
    form.reset();
  };

  return {
    handleAddNew,
    handleEditClick,
    handleSave,
    isOpenModalForm,
    setIsOpenModalForm: handleModalClose,
    performanceCompetencies,
    form,
    isSubmitting:
      mutateAddPerformanceCompetency.isPending ||
      mutateUpdatePerformanceCompetency.isPending,
    isOpenDeleteModal,
    setIsOpenDeleteModal,
    handleDeleteClick,
    handleDeleteConfirm,
    isDeleting: mutateDeletePerformanceCompetency.isPending,
    isEditing: editingId !== null,
  };
};
