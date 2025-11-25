/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getPerformanceCompetenciesDetail,
  getPerformanceCompetencyLevels,
  postAddPerformanceCompetencyLevel,
  updatePerformanceCompetencyLevel,
  deletePerformanceCompetencyLevel,
} from "@/services/performance-competency";
import { IMutatePerformanceCompetencyLevel } from "@/services/performance-competency/types";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { useParams } from "next/navigation";

export const usePerformanceCompetencyDetails = () => {
  const params = useParams();
  const competencyId = Number(params.id);
  const queryClient = useQueryClient();

  const form = useForm<IMutatePerformanceCompetencyLevel>({
    defaultValues: {
      performance_competency_id: competencyId,
      dimensions: "",
      level: "",
      name: "",
      description: "",
    },
  });

  const [isOpenModalForm, setIsOpenModalForm] = React.useState(false);
  const [isOpenDeleteModal, setIsOpenDeleteModal] = React.useState(false);
  const [selectedId, setSelectedId] = React.useState<number | null>(null);
  const [editingId, setEditingId] = React.useState<number | null>(null);

  // Fetch competency details
  const { data: competencyDetails, isLoading: isLoadingDetails } = useQuery({
    queryKey: ["performance-competency-detail", competencyId],
    queryFn: () => getPerformanceCompetenciesDetail(competencyId),
    enabled: !!competencyId,
  });

  // Fetch competency levels
  const { data: competencyLevels, isLoading: isLoadingLevels } = useQuery({
    queryKey: ["performance-competency-levels"],
    queryFn: () => getPerformanceCompetencyLevels(),
  });

  // Add level mutation
  const mutateAddLevel = useMutation({
    mutationFn: (params: IMutatePerformanceCompetencyLevel) =>
      postAddPerformanceCompetencyLevel(params),
    onSuccess: () => {
      setIsOpenModalForm(false);
      setEditingId(null);
      form.reset({
        performance_competency_id: competencyId,
        dimensions: "",
        level: "",
        name: "",
        description: "",
      });
      queryClient.invalidateQueries({
        queryKey: ["performance-competency-levels"],
      });
      toast.success("Level added successfully");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to add level");
    },
  });

  // Update level mutation
  const mutateUpdateLevel = useMutation({
    mutationFn: ({
      id,
      params,
    }: {
      id: number;
      params: IMutatePerformanceCompetencyLevel;
    }) => updatePerformanceCompetencyLevel(id, params),
    onSuccess: () => {
      setIsOpenModalForm(false);
      setEditingId(null);
      form.reset({
        performance_competency_id: competencyId,
        dimensions: "",
        level: "",
        name: "",
        description: "",
      });
      queryClient.invalidateQueries({
        queryKey: ["performance-competency-levels"],
      });
      toast.success("Level updated successfully");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update level");
    },
  });

  // Delete level mutation
  const mutateDeleteLevel = useMutation({
    mutationFn: (id: number) => deletePerformanceCompetencyLevel(id),
    onSuccess: () => {
      setIsOpenDeleteModal(false);
      setSelectedId(null);
      queryClient.invalidateQueries({
        queryKey: ["performance-competency-levels"],
      });
      toast.success("Level deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to delete level");
    },
  });

  const handleAddNew = () => {
    form.reset({
      performance_competency_id: competencyId,
      dimensions: "",
      level: "",
      name: "",
      description: "",
    });
    setEditingId(null);
    setIsOpenModalForm(true);
  };

  const handleEditClick = (id: number) => {
    const level = competencyLevels?.data.data.find(
      (item: any) => item.id === id,
    );
    if (level) {
      form.reset({
        performance_competency_id: competencyId,
        dimensions: level.dimensions,
        level: level.level,
        name: level.name,
        description: level.description,
      });
      setEditingId(id);
      setIsOpenModalForm(true);
    }
  };

  const handleSave = form.handleSubmit(
    (data: IMutatePerformanceCompetencyLevel) => {
      if (editingId !== null) {
        mutateUpdateLevel.mutate({ id: editingId, params: data });
      } else {
        mutateAddLevel.mutate(data);
      }
    },
  );

  const handleDeleteClick = (id: number) => {
    setSelectedId(id);
    setIsOpenDeleteModal(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedId !== null) {
      mutateDeleteLevel.mutate(selectedId);
    }
  };

  const handleModalClose = () => {
    setIsOpenModalForm(false);
    setEditingId(null);
    form.reset({
      performance_competency_id: competencyId,
      dimensions: "",
      level: "",
      name: "",
      description: "",
    });
  };

  // Filter levels by competency ID
  const filteredLevels = React.useMemo(() => {
    if (!competencyLevels?.data.data) return [];
    return competencyLevels.data.data.filter(
      (level: any) => level.performance_competency_id === competencyId,
    );
  }, [competencyLevels, competencyId]);

  return {
    handleAddNew,
    handleEditClick,
    handleSave,
    isOpenModalForm,
    setIsOpenModalForm: handleModalClose,
    competencyDetails: competencyDetails?.data,
    competencyLevels: filteredLevels,
    isLoadingDetails,
    isLoadingLevels,
    form,
    isSubmitting: mutateAddLevel.isPending || mutateUpdateLevel.isPending,
    isEditing: editingId !== null,
    isOpenDeleteModal,
    setIsOpenDeleteModal,
    handleDeleteClick,
    handleDeleteConfirm,
    isDeleting: mutateDeleteLevel.isPending,
  };
};
