'use client';

import { addWidgets, getWidgets } from '@/services/dashboard';
import { RequestWidget } from '@/services/dashboard/types';
import { getAllForm, getFields } from '@/services/form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { HTTPError } from 'ky';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

const INITIAL_FORM = {
  label: '',
  dataSource: '',
  formSource: '',
  rows: '',
  columns: '',
  dataSummary: '',
  dataVisualization: '',
  fieldId: '',
};

const ASSESSMENT_FIELD_TYPES = ['range'] as const;
const OFFBOARDING_FIELD_TYPES = ['checkbox', 'select', 'radio', 'range'] as const;

export function useDashboarAssessment() {
  const queryClient = useQueryClient();
  const [open, setOpenState] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);

  const isOffboarding = form.dataSource === 'offboarding';
  const isAssessment =
    form.dataSource === 'self_assessment' ||
    form.dataSource === 'supervisor_assessment';

  const { data: dataForm, isLoading: loadingForm } = useQuery({
    queryKey: ['forms'],
    queryFn: () => getAllForm(),
  });

  const { data: dataFormId, isLoading: loadingFormId } = useQuery({
    queryKey: ['formsId', form.formSource],
    queryFn: () => getFields({ form_id: Number(form.formSource) }),
    enabled: !!form.formSource,
  });

  const selectableFields = useMemo(() => {
    const allowed = isOffboarding
      ? OFFBOARDING_FIELD_TYPES
      : ASSESSMENT_FIELD_TYPES;

    return (dataFormId?.data ?? []).filter((item) =>
      (allowed as readonly string[]).includes(item.type),
    );
  }, [dataFormId?.data, isOffboarding]);

  const canSubmit = Boolean(
    form.label.trim() &&
      form.dataSource &&
      form.formSource &&
      form.fieldId &&
      form.rows &&
      form.columns &&
      form.dataSummary &&
      form.dataVisualization,
  );

  const resetForm = () => setForm(INITIAL_FORM);

  const setOpen = (next: boolean) => {
    setOpenState(next);
    if (!next) {
      resetForm();
    }
  };

  const setDataSource = (val: string) => {
    setForm((prev) => ({
      ...prev,
      dataSource: val,
      fieldId: '',
      // Offboarding ignores Baris/Kolom; send stable defaults for API validation.
      ...(val === 'offboarding'
        ? { rows: 'answer_option', columns: 'answer_option' }
        : {}),
    }));
  };

  const { mutate: addWidget, isPending: isPendingAddWidget } = useMutation({
    mutationFn: (params: RequestWidget) => addWidgets(params),
    onSuccess: () => {
      toast.success('Widget created successfully!');
      queryClient.invalidateQueries({ queryKey: ['widget'] });
      setOpen(false);
    },
    onError: async (error) => {
      if (error instanceof HTTPError) {
        try {
          const errorData = (await error.response.json()) as {
            message?: string;
            errors?: Record<string, string[]>;
          };
          const fieldErrors = Object.values(errorData.errors ?? {}).flat();
          const message =
            errorData.message ||
            fieldErrors[0] ||
            'Failed to create widget.';
          toast.error(message);
          return;
        } catch {
          // fall through
        }
      }
      toast.error('Failed to create widget.');
    },
  });

  const onSubmit = () => {
    if (!canSubmit) {
      toast.error(
        'Please complete all required fields, including a form field.',
      );
      return;
    }

    const payload: RequestWidget = {
      label: form.label.trim(),
      measurement: form.dataSource,
      form_id: Number(form.formSource),
      field_id: Number(form.fieldId),
      rows: form.rows,
      columns: form.columns,
      data_summary: form.dataSummary,
      visualization: form.dataVisualization,
    };
    addWidget(payload);
  };

  const {
    data: dataWidget,
    isLoading: loadingDataWidget,
    isError: errorDataWidget,
  } = useQuery({
    queryKey: ['widget'],
    queryFn: getWidgets,
  });

  return {
    form,
    setForm,
    setDataSource,
    open,
    setOpen,
    dataForm,
    loadingForm,
    onSubmit,
    dataWidget,
    loadingDataWidget,
    errorDataWidget,
    isPendingAddWidget,
    dataFormId,
    loadingFormId,
    selectableFields,
    canSubmit,
    isOffboarding,
    isAssessment,
  };
}
