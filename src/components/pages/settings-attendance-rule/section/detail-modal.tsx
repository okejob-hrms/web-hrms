'use client';

import dayjs from 'dayjs';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { AttendanceRule } from '@/services/attendance-rule/types';

interface AttendanceRuleDetailProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rule?: AttendanceRule;
  onEdit?: () => void;
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <div className="text-xs text-text-secondary">{label}</div>
      <div className="text-sm font-medium text-foreground">{children}</div>
    </div>
  );
}

const formatPeriod = (
  starts: string | null,
  ends: string | null,
): string => {
  if (!starts && !ends) return 'Tidak ditentukan';
  const start = starts ? dayjs(starts).format('DD MMM YYYY') : 'Tidak ditentukan';
  const end = ends ? dayjs(ends).format('DD MMM YYYY') : 'Selamanya';
  return `${start} - ${end}`;
};

const formatThreshold = (rule: AttendanceRule): string => {
  const { min_threshold, max_threshold, condition_type } = rule;
  const unit = condition_type === 'monthly_aggregate' ? 'kejadian' : 'menit';
  if (min_threshold === null && max_threshold === null) return '-';
  if (min_threshold !== null && max_threshold !== null) {
    return `${min_threshold}–${max_threshold} ${unit}`;
  }
  if (min_threshold !== null) return `≥ ${min_threshold} ${unit}`;
  if (max_threshold !== null) return `≤ ${max_threshold} ${unit}`;
  return '-';
};

export default function AttendanceRuleDetail({
  open,
  onOpenChange,
  rule,
  onEdit,
}: AttendanceRuleDetailProps) {
  if (!rule) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle>Detail Aturan Kehadiran</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-6 pt-2">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-base font-semibold">{rule.name}</h3>
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={
                    rule.condition_type === 'per_occurrence'
                      ? 'default'
                      : 'secondary'
                  }
                >
                  {rule.condition_type_label}
                </Badge>
                <Badge variant="outline">{rule.trigger_type_label}</Badge>
                <Badge variant={rule.is_active ? 'default' : 'secondary'}>
                  {rule.is_active ? 'Aktif' : 'Nonaktif'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Kondisi & Trigger */}
          <section className="space-y-3 border-t pt-4">
            <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
              Kondisi & Trigger
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <Field label="Threshold">{formatThreshold(rule)}</Field>
              <Field label="Dispensasi/Bulan">
                {rule.condition_type === 'per_occurrence'
                  ? `${rule.monthly_free_count ?? 0}x`
                  : '-'}
              </Field>
              <Field label="Prioritas">{rule.priority}</Field>
            </div>
          </section>

          {/* Dampak & Nilai */}
          <section className="space-y-3 border-t pt-4">
            <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
              Dampak & Nilai
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <Field label="Dampak">{rule.impact_type_label}</Field>
              {rule.target_allowance_type && (
                <Field label="Tipe Tunjangan">
                  {rule.target_allowance_type.name}
                </Field>
              )}
              <Field label="Tipe Nilai">{rule.value_type_label}</Field>
              <Field label="Nilai">{rule.amount_formatted}</Field>
            </div>
          </section>

          {/* Shifts */}
          <section className="space-y-3 border-t pt-4">
            <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
              Shift Terdampak
            </h4>
            <div className="flex flex-wrap gap-2">
              {rule.shifts.length === 0 ? (
                <span className="text-sm text-text-secondary">-</span>
              ) : (
                rule.shifts.map((s) => (
                  <Badge key={s.id} variant="outline">
                    {s.name}
                  </Badge>
                ))
              )}
            </div>
          </section>

          {/* Periode & Note */}
          <section className="space-y-3 border-t pt-4">
            <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
              Lain-lain
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Periode Berlaku">
                {formatPeriod(rule.starts_on, rule.ends_on)}
              </Field>
              <Field label="Terakhir Diperbarui">
                {dayjs(rule.updated_at).format('DD MMM YYYY, HH:mm')}
              </Field>
            </div>
            {rule.note && (
              <Field label="Catatan">
                <span className="font-normal whitespace-pre-wrap">
                  {rule.note}
                </span>
              </Field>
            )}
          </section>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Tutup
          </Button>
          {onEdit && <Button onClick={onEdit}>Edit</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
