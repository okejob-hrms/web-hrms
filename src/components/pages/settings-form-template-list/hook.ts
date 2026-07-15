/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { deleteForm, getAllForm, postCreateForm } from "@/services/form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiErrorResponse } from "@/lib/types";
import { useFormContext } from "react-hook-form";
import { IMutateFormRequest } from "@/services/form/types";
import { PaginationState } from "@tanstack/react-table";
import { useDebounce } from "@/hooks/use-debounce";

export interface FormTemplateListFilters {
  search: string;
}

export function useFormTemplateList() {
  const router = useRouter();
  const form = useFormContext();
  const queryClient = useQueryClient();
  const [openDelete, setOpenDelete] = React.useState(false);
  const [openAdd, setOpenAdd] = React.useState(false);
  const [selectedId, setSelectedId] = React.useState<string>("");
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [filters, setFilters] = React.useState<FormTemplateListFilters>({
    search: "",
  });

  const debouncedSearch = useDebounce(filters.search, 300);

  const queryParams = React.useMemo(
    () => ({
      page: pagination.pageIndex + 1,
      per_page: pagination.pageSize,
      search: debouncedSearch || undefined,
      sort_by: "created_at" as const,
      sort_dir: "desc" as const,
    }),
    [pagination, debouncedSearch],
  );

  const { data, isLoading: loading } = useQuery({
    queryKey: ["forms", queryParams],
    queryFn: () => getAllForm(queryParams),
  });

  const createFormMutation = useMutation({
    mutationFn: postCreateForm,
    onSuccess: () => {
      toast.success("Create form successfully!");
      queryClient.invalidateQueries({ queryKey: ["forms"] });
    },
    onError: (error: any) => {
      if (error?.response) {
        try {
          error.response
            .json()
            .then((errorData: ApiErrorResponse) => {
              if (errorData.errors) {
                Object.entries(errorData.errors).forEach(
                  ([fieldName, messages]) => {
                    form.setError(fieldName as any, {
                      type: "server",
                      message: messages[0],
                    });
                  },
                );
              }
              toast.error(errorData.message || "Failed to create form");
            })
            .catch(() => {
              toast.error("Failed to create form: Server error");
            });
        } catch (parseError) {
          toast.error("Failed to create form: Server error");
        }
      } else {
        toast.error(
          `Failed to create form: ${error.message || "Unknown error"}`,
        );
      }
    },
  });

  const { mutate: removeForm } = useMutation({
    mutationFn: (id: number) => deleteForm(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forms"] });
      toast.success("Success delete form");
      setOpenDelete(false);
    },
    onError: () => {
      toast.error("Failed delete form");
    },
  });

  const handleNew = () => {
    setOpenAdd(true);
  };

  const handleEdit = (id: number | string) => {
    router.push(`/settings/form-template/${id}`);
  };

  const handleDelete = () => {
    if (!selectedId) return;
    removeForm(Number(selectedId));
  };

  const formOptions = [
    { label: "Exit Interview Form", value: "1" },
    { label: "Competency Based Assessment", value: "2" },
  ];

  const handleSave = (e: IMutateFormRequest) => {
    createFormMutation.mutate(e);
  };

  const handleFiltersChange = React.useCallback(
    (next: Partial<FormTemplateListFilters>) => {
      setFilters((prev) => ({ ...prev, ...next }));
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    },
    [],
  );

  return {
    forms: data?.data,
    apiPagination: data?.pagination,
    loading,
    pagination,
    setPagination,
    filters,
    handleFiltersChange,
    handleNew,
    handleEdit,
    openDelete,
    setOpenDelete,
    openAdd,
    setOpenAdd,
    handleDelete,
    setSelectedId,
    formOptions,
    handleSave,
  };
}
