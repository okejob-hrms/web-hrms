'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PaginationState } from '@tanstack/react-table';
import { HTTPError } from 'ky';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';

import {
  deleteAttendanceRule,
  getAttendanceRules,
  postAttendanceRule,
  putAttendanceRule,
} from '@/services/attendance-rule';
import {
  AttendanceRule,
  AttendanceRuleConditionType,
  AttendanceRuleRequest,
  AttendanceRuleTriggerType,
} from '@/services/attendance-rule/types';
import { getAllowanceTypes } from '@/services/allowance-types';
import { getShift } from '@/services/settings';
import { ApiErrorResponse } from '@/lib/types';

export type ActiveFilter = 'all' | 'active' | 'inactive';

export interface AttendanceRuleFilters {
  search: string;
  condition_type: AttendanceRuleConditionType | 'all';
  trigger_type: AttendanceRuleTriggerType | 'all';
  is_active: ActiveFilter;
}

const DEFAULT_FILTERS: AttendanceRuleFilters = {
  search: '',
  condition_type: 'all',
  trigger_type: 'all',
  is_active: 'all',
};

export function useAttendanceRule() {
  const queryClient = useQueryClient();

  const [openForm, setOpenForm] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);
  const [selectedRule, setSelectedRule] = useState<AttendanceRule | undefined>();

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const [filters, setFilters] = useState<AttendanceRuleFilters>(DEFAULT_FILTERS);

  const queryParams = useMemo(
    () => ({
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      search: filters.search || undefined,
      condition_type:
        filters.condition_type === 'all' ? undefined : filters.condition_type,
      trigger_type:
        filters.trigger_type === 'all' ? undefined : filters.trigger_type,
      is_active:
        filters.is_active === 'all'
          ? undefined
          : ((filters.is_active === 'active' ? 1 : 0) as 0 | 1),
    }),
    [pagination, filters],
  );

  const listQuery = useQuery({
    queryKey: ['attendanceRules', queryParams],
    queryFn: () => getAttendanceRules(queryParams),
    staleTime: 1000 * 30,
  });

  const shiftQuery = useQuery({
    queryKey: ['shiftList'],
    queryFn: getShift,
    staleTime: 1000 * 60 * 5,
  });

  const allowanceTypeQuery = useQuery({
    queryKey: ['allowanceTypes'],
    queryFn: getAllowanceTypes,
    staleTime: 1000 * 60 * 5,
  });

  const shiftOptions = useMemo(
    () =>
      shiftQuery.data?.data?.map((s) => ({
        value: String(s.id),
        label: s.name,
      })) ?? [],
    [shiftQuery.data],
  );

  const allowanceTypeOptions = useMemo(
    () =>
      allowanceTypeQuery.data?.data?.map((a) => ({
        value: String(a.id),
        label: a.name,
      })) ?? [],
    [allowanceTypeQuery.data],
  );

  const saveMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id?: number;
      data: AttendanceRuleRequest;
    }) => (id ? putAttendanceRule(id, data) : postAttendanceRule(data)),
    onSuccess: () => {
      toast.success('Aturan kehadiran berhasil disimpan');
      queryClient.invalidateQueries({ queryKey: ['attendanceRules'] });
      setOpenForm(false);
      setSelectedRule(undefined);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteAttendanceRule(id),
    onSuccess: () => {
      toast.success('Aturan kehadiran berhasil dihapus');
      queryClient.invalidateQueries({ queryKey: ['attendanceRules'] });
      setOpenDelete(false);
      setSelectedRule(undefined);
    },
    onError: async (error) => {
      if (error instanceof HTTPError) {
        try {
          const errorData = (await error.response.json()) as ApiErrorResponse;
          toast.error(errorData.message || 'Gagal menghapus aturan');
          return;
        } catch (_) {
          // fall through
        }
      }
      toast.error(`Gagal menghapus aturan: ${error.message}`);
    },
  });

  const handleAdd = useCallback(() => {
    setSelectedRule(undefined);
    setOpenForm(true);
  }, []);

  const handleEdit = useCallback((rule: AttendanceRule) => {
    setSelectedRule(rule);
    setOpenForm(true);
  }, []);

  const handleDetail = useCallback((rule: AttendanceRule) => {
    setSelectedRule(rule);
    setOpenDetail(true);
  }, []);

  const handleEditFromDetail = useCallback(() => {
    setOpenDetail(false);
    setOpenForm(true);
  }, []);

  const handleDeleteClick = useCallback((rule: AttendanceRule) => {
    setSelectedRule(rule);
    setOpenDelete(true);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    if (selectedRule) deleteMutation.mutate(selectedRule.id);
  }, [selectedRule, deleteMutation]);

  const handleCloseForm = useCallback(() => {
    setOpenForm(false);
    setSelectedRule(undefined);
  }, []);

  return {
    listQuery,
    pagination,
    setPagination,
    filters,
    setFilters,
    shiftOptions,
    allowanceTypeOptions,
    openForm,
    setOpenForm,
    openDelete,
    setOpenDelete,
    openDetail,
    setOpenDetail,
    selectedRule,
    handleAdd,
    handleEdit,
    handleDetail,
    handleEditFromDetail,
    handleDeleteClick,
    handleDeleteConfirm,
    handleCloseForm,
    saveMutation,
    deleteMutation,
  };
}
