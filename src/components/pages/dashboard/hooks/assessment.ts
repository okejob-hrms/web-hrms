'use client';

import { addWidgets, getWidgets } from '@/services/dashboard';
import { RequestWidget } from '@/services/dashboard/types';
import { getAllForm } from '@/services/form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';

export function useDashboarAssessment() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    label: "",
    dataSource: "",
    formSource: "",
    rows: "",
    columns: "",
    dataSummary: "",
    dataVisualization: "",
  });

  const {
    data: dataForm,
    isLoading: loadingForm
  } = useQuery({
    queryKey: ["forms"],
    queryFn: getAllForm,
  });

  const { mutate: addWidget, isPending: isPendingAddWidget } =
    useMutation({
      mutationFn: (params: RequestWidget) =>
        addWidgets(params),
      onSuccess: () => {
        toast.success("Add assessment successfully!");
        queryClient.invalidateQueries({ queryKey: ["widget"] });
      },
      onError: () => {
        toast.error("Add assessment failed!");
        
      },
    });

  const onSubmit = () => {
    const payload = {
      label: form.label,
      measurement: form.dataSource,
      form_id: Number(form.formSource),
      rows: form.rows,
      columns: form.columns,
      data_summary: form.dataSummary,
      visualization: form.dataVisualization,
    }
      addWidget(payload);
  }

  const { data: dataWidget, isLoading: loadingDataWidget, isError: errorDataWidget } = useQuery({
    queryKey: ["widget"],
    queryFn: getWidgets,
  });

  return {
    form,
    setForm,
    open,
    setOpen,
    dataForm,
    loadingForm,
    onSubmit,
    dataWidget,
    loadingDataWidget,
    errorDataWidget,
    isPendingAddWidget
  };
}
