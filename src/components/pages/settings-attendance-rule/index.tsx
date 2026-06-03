'use client';

import * as React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Plus, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { DataTable } from '@/components/tables/data-table';
import { RowActions } from '@/components/tables/row-actions';

import { useAttendanceRule } from './hook';
import AttendanceRuleForm from './section/form-modal';
import AttendanceRuleDelete from './section/delete-modal';
import AttendanceRuleDetail from './section/detail-modal';
import AttendanceRuleEmptyState from './section/empty-state';

import {
  AttendanceRule,
  AttendanceRuleConditionType,
  AttendanceRuleTriggerType,
} from '@/services/attendance-rule/types';
import { useDebounce } from '@/hooks/use-debounce';

const conditionBadgeVariant = (
  type: AttendanceRuleConditionType,
): React.ComponentProps<typeof Badge>['variant'] =>
  type === 'per_occurrence' ? 'default' : 'secondary';

const triggerBadgeVariant = (
  type: AttendanceRuleTriggerType,
): React.ComponentProps<typeof Badge>['variant'] => {
  if (type === 'late') return 'default';
  if (type === 'early_leave') return 'secondary';
  return 'outline';
};

const formatImpactValue = (rule: AttendanceRule): string => {
  if (rule.target_allowance_type) {
    return `${rule.amount_formatted} · ${rule.target_allowance_type.name}`;
  }
  return `${rule.amount_formatted} · ${rule.impact_type_label}`;
};

export default function SettingsAttendanceRule() {
  const {
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
  } = useAttendanceRule();

  const [searchInput, setSearchInput] = React.useState(filters.search);
  const debouncedSearch = useDebounce(searchInput, 400);

  React.useEffect(() => {
    if (debouncedSearch !== filters.search) {
      setFilters((prev) => ({ ...prev, search: debouncedSearch }));
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const toggleActiveMutation = saveMutation;

  const handleToggleActive = (rule: AttendanceRule) => {
    toggleActiveMutation.mutate({
      id: rule.id,
      data: {
        name: rule.name,
        shift_id: rule.shifts.map((s) => s.id),
        condition_type: rule.condition_type,
        trigger_type: rule.trigger_type,
        min_threshold: rule.min_threshold,
        max_threshold: rule.max_threshold,
        monthly_free_count: rule.monthly_free_count,
        impact_type: rule.impact_type,
        target_allowance_type_id: rule.target_allowance_type_id,
        value_type: rule.value_type,
        amount: Number(rule.amount),
        priority: rule.priority,
        is_active: !rule.is_active,
        starts_on: rule.starts_on,
        ends_on: rule.ends_on,
        note: rule.note,
      },
    });
  };

  const columns: ColumnDef<AttendanceRule>[] = [
    {
      accessorKey: 'name',
      header: 'Nama Aturan',
      cell: ({ row }) => (
        <span className="font-medium">{row.original.name}</span>
      ),
    },
    {
      accessorKey: 'condition_type',
      header: 'Tipe Kondisi',
      cell: ({ row }) => (
        <Badge variant={conditionBadgeVariant(row.original.condition_type)}>
          {row.original.condition_type_label}
        </Badge>
      ),
    },
    {
      accessorKey: 'trigger_type',
      header: 'Trigger',
      cell: ({ row }) => (
        <Badge variant={triggerBadgeVariant(row.original.trigger_type)}>
          {row.original.trigger_type_label}
        </Badge>
      ),
    },
    {
      accessorKey: 'impact',
      header: 'Dampak & Nilai',
      cell: ({ row }) => (
        <span className="font-medium">{formatImpactValue(row.original)}</span>
      ),
    },
    {
      accessorKey: 'is_active',
      header: 'Status',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Switch
            checked={row.original.is_active}
            onCheckedChange={() => handleToggleActive(row.original)}
            disabled={toggleActiveMutation.isPending}
          />
          <span className="text-xs text-text-secondary">
            {row.original.is_active ? 'Aktif' : 'Nonaktif'}
          </span>
        </div>
      ),
    },
    {
      id: 'actions',
      header: '',
      size: 60,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <RowActions
            onDetail={() => handleDetail(row.original)}
            onEdit={() => handleEdit(row.original)}
            onDelete={() => handleDeleteClick(row.original)}
          />
        </div>
      ),
    },
  ];

  const rules = listQuery.data?.data ?? [];
  const meta = listQuery.data?.meta;
  const links = listQuery.data?.links;
  const apiPagination = meta
    ? {
        current_page: meta.current_page,
        per_page: meta.per_page,
        total: meta.total,
        last_page: meta.last_page,
        from: meta.from ?? 0,
        to: meta.to ?? 0,
        first: links?.first ?? '',
        last: links?.last ?? '',
        prev: links?.prev ?? null,
        next: links?.next ?? null,
      }
    : undefined;
  const isLoading = listQuery.isLoading;
  const hasFilter =
    !!filters.search ||
    filters.condition_type !== 'all' ||
    filters.trigger_type !== 'all' ||
    filters.is_active !== 'all';
  const isInitiallyEmpty = !isLoading && rules.length === 0 && !hasFilter;

  return (
    <div className="rounded-md bg-white border shadow-sm border-gray-200 flex flex-col gap-4 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-semibold text-xl">Aturan Kehadiran</h2>
          <p className="text-sm text-text-secondary">
            Atur potongan penalty untuk keterlambatan dan pulang cepat.
          </p>
        </div>
        {!isInitiallyEmpty && (
          <Button
            className="flex flex-row items-center gap-2"
            onClick={handleAdd}
          >
            <Plus className="w-4 h-4" />
            Tambah Aturan
          </Button>
        )}
      </div>

      {!isInitiallyEmpty && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="relative sm:col-span-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
            <Input
              placeholder="Cari nama aturan…"
              className="pl-9"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>

          <Select
            value={filters.condition_type}
            onValueChange={(v) => {
              setFilters((prev) => ({
                ...prev,
                condition_type: v as AttendanceRuleConditionType | 'all',
              }));
              setPagination((p) => ({ ...p, pageIndex: 0 }));
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Tipe Kondisi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kondisi</SelectItem>
              <SelectItem value="per_occurrence">Per Kejadian</SelectItem>
              <SelectItem value="monthly_aggregate">Akumulasi Bulanan</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.trigger_type}
            onValueChange={(v) => {
              setFilters((prev) => ({
                ...prev,
                trigger_type: v as AttendanceRuleTriggerType | 'all',
              }));
              setPagination((p) => ({ ...p, pageIndex: 0 }));
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Trigger" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Trigger</SelectItem>
              <SelectItem value="late">Keterlambatan</SelectItem>
              <SelectItem value="early_leave">Pulang Cepat</SelectItem>
              <SelectItem value="both">Keduanya</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.is_active}
            onValueChange={(v) => {
              setFilters((prev) => ({
                ...prev,
                is_active: v as 'all' | 'active' | 'inactive',
              }));
              setPagination((p) => ({ ...p, pageIndex: 0 }));
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="active">Aktif</SelectItem>
              <SelectItem value="inactive">Nonaktif</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {isInitiallyEmpty ? (
        <AttendanceRuleEmptyState onCreate={handleAdd} />
      ) : (
        <DataTable
          columns={columns}
          data={rules}
          loading={isLoading}
          apiPagination={apiPagination}
          paginationState={pagination}
          setPaginationState={setPagination}
        />
      )}

      <AttendanceRuleForm
        open={openForm}
        onOpenChange={setOpenForm}
        initialData={selectedRule}
        shiftOptions={shiftOptions}
        allowanceTypeOptions={allowanceTypeOptions}
        onClose={handleCloseForm}
        saveMutation={saveMutation}
      />

      <AttendanceRuleDetail
        open={openDetail}
        onOpenChange={setOpenDetail}
        rule={selectedRule}
        onEdit={handleEditFromDetail}
      />

      <AttendanceRuleDelete
        open={openDelete}
        onOpenChange={setOpenDelete}
        onDelete={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
        ruleName={selectedRule?.name}
      />
    </div>
  );
}
