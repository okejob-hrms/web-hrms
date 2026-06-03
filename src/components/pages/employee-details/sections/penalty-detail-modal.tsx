import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getDetailsPenalty } from "@/services/employees/penalties";
import { useQuery } from "@tanstack/react-query";
import { formatDateTime, rupiahFormatter } from "@/lib/helpers";
import { Badge } from "@/components/ui/badge";
import {
  formatConfiguredValue,
  formatPeriod,
  getAppliedAmount,
  getConditionLabel,
  getImpactLabel,
  getTriggerLabel,
  getValueTypeLabel,
  isDispensation,
} from "./penalty-utils";

interface PenaltyDetailModalProps {
  penaltyId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`space-y-1 ${className}`}>
      <div className="text-xs text-grayscale-50">{label}</div>
      <div className="text-sm font-medium text-grayscale-90">{children}</div>
    </div>
  );
}

export function PenaltyDetailModal({
  penaltyId,
  open,
  onOpenChange,
}: PenaltyDetailModalProps) {
  const { data: penaltyData, isLoading } = useQuery({
    queryKey: ["penalty-detail", penaltyId],
    queryFn: () => getDetailsPenalty(penaltyId!),
    enabled: !!penaltyId && open,
  });

  const penalty = penaltyData?.data;
  const meta = penalty?.meta;
  const isAggregate = penalty?.condition_type === "monthly_aggregate";
  const dispensation = penalty ? isDispensation(penalty) : false;
  const appliedAmount = penalty ? getAppliedAmount(penalty) : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] bg-white max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Penalty Details</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center p-4">Loading...</div>
        ) : penalty ? (
          <div className="flex flex-col gap-5 text-sm">
            {/* Header */}
            <div className="space-y-2">
              <div className="text-base font-semibold text-grayscale-90">
                {penalty.name}
              </div>
              {meta?.rule_name && meta.rule_name !== penalty.name ? (
                <div className="text-xs text-grayscale-50">
                  Aturan: {meta.rule_name}
                </div>
              ) : null}
              <div className="flex flex-wrap gap-2 pt-1">
                {meta?.trigger_type ? (
                  <Badge variant="outline" className="font-normal">
                    {getTriggerLabel(meta.trigger_type)}
                  </Badge>
                ) : null}
                <Badge variant="secondary" className="font-normal">
                  {getConditionLabel(penalty.condition_type)}
                </Badge>
                {meta?.impact_type ? (
                  <Badge variant="outline" className="font-normal">
                    Dampak: {getImpactLabel(meta.impact_type)}
                  </Badge>
                ) : null}
                {dispensation ? (
                  <Badge
                    variant="outline"
                    className="border-success text-success font-normal"
                  >
                    Dispensasi
                  </Badge>
                ) : null}
              </div>
            </div>

            {/* Applied penalty highlight */}
            <div className="rounded-lg border border-grayscale-20 bg-grayscale-10 p-4">
              <div className="text-xs text-grayscale-50">Potongan Diterapkan</div>
              {dispensation ? (
                <div className="text-lg font-semibold text-success">
                  Tanpa Potongan
                </div>
              ) : (
                <div className="text-lg font-semibold text-error">
                  {rupiahFormatter(appliedAmount)}
                </div>
              )}
            </div>

            {/* Description */}
            {penalty.description ? (
              <Field label="Deskripsi" className="">
                <span className="font-normal text-grayscale-70">
                  {penalty.description}
                </span>
              </Field>
            ) : null}

            {/* Detail grid */}
            <div className="grid grid-cols-2 gap-4 border-t border-grayscale-20 pt-4">
              <Field label="Period">{formatPeriod(penalty.period)}</Field>
              <Field label="Point">{penalty.point ?? 0}</Field>

              {meta?.configured_amount !== undefined ? (
                <Field label="Nilai Aturan">
                  {formatConfiguredValue(
                    meta.configured_amount,
                    meta.value_type,
                  )}
                </Field>
              ) : null}
              {meta?.value_type ? (
                <Field label="Tipe Nilai">
                  {getValueTypeLabel(meta.value_type)}
                </Field>
              ) : null}

              {/* Per-occurrence specifics */}
              {!isAggregate && meta?.minutes !== undefined ? (
                <Field label="Durasi">{meta.minutes} menit</Field>
              ) : null}
              {!isAggregate && meta?.occurrence_index !== undefined ? (
                <Field label="Kejadian ke-">{meta.occurrence_index}</Field>
              ) : null}
              {!isAggregate && meta?.monthly_free_count !== undefined ? (
                <Field label="Kuota Dispensasi / Bulan">
                  {meta.monthly_free_count}
                </Field>
              ) : null}

              {/* Aggregate specifics */}
              {isAggregate && meta?.count !== undefined ? (
                <Field label="Jumlah Kejadian">{meta.count}</Field>
              ) : null}

              {/* Threshold range */}
              {meta?.min_threshold !== undefined &&
              meta?.max_threshold !== undefined ? (
                <Field label="Rentang Threshold">
                  {meta.min_threshold} – {meta.max_threshold}
                </Field>
              ) : null}

              <Field label="Valid Until">
                {penalty.valid_until
                  ? formatDateTime(penalty.valid_until).date
                  : "-"}
              </Field>
            </div>

            {/* Footer meta */}
            <div className="border-t border-grayscale-20 pt-4 space-y-1 text-xs text-grayscale-50">
              <div>
                Created At: {formatDateTime(penalty.created_at).date}{" "}
                {formatDateTime(penalty.created_at).hour}
              </div>
              <div>
                Updated At: {formatDateTime(penalty.updated_at).date}{" "}
                {formatDateTime(penalty.updated_at).hour}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-muted-foreground p-4">
            No details found.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
