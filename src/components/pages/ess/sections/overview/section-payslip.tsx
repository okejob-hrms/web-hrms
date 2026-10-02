'use client';

import * as React from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Eye, Printer } from 'lucide-react';

import {
  getEssPayslips,
  getEssPayslipDetail,
  requestEssPayslipView,
  requestEssPayslipPrint,
} from '@/services/ess';
import type { EssPayslipItem } from '@/services/ess/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

function statusBadge(item: EssPayslipItem) {
  if (item.status === 1) return <Badge variant="default">{item.status_label}</Badge>;
  if (item.status === 2) return <Badge variant="secondary">{item.status_label}</Badge>;
  return <Badge variant="outline">{item.status_label ?? String(item.status)}</Badge>;
}

export const SectionPayslip = () => {
  const t = useTranslations('ess');
  const tCommon = useTranslations('common');

  const [selectedId, setSelectedId] = React.useState<number | null>(null);
  const [detailOpen, setDetailOpen] = React.useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['ess-payslips'],
    queryFn: () => getEssPayslips({ per_page: 50 }),
  });

  const { data: detailData, isLoading: detailLoading } = useQuery({
    queryKey: ['ess-payslip-detail', selectedId],
    queryFn: () => getEssPayslipDetail(selectedId as number),
    enabled: !!selectedId && detailOpen,
  });

  const viewMutation = useMutation({
    mutationFn: (id: number) => requestEssPayslipView(id),
    onSuccess: () => toast.success(t('payslipViewRequested')),
    onError: () => toast.error(t('payslipRequestFailed')),
  });

  const printMutation = useMutation({
    mutationFn: (id: number) => requestEssPayslipPrint(id),
    onSuccess: () => toast.success(t('payslipPrintRequested')),
    onError: () => toast.error(t('payslipRequestFailed')),
  });

  const rows = data?.data ?? [];

  const openDetail = (item: EssPayslipItem) => {
    setSelectedId(item.id);
    setDetailOpen(true);
  };

  const detail = detailData?.data;

  return (
    <div className="font-sans min-h-screen flex flex-col space-y-6 px-6 md:px-12">
      <h2 className="font-semibold text-xl text-primary">{t('myPayslip')}</h2>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">{tCommon('noData')}</p>
      ) : (
        <div className="space-y-3">
          {rows.map((item) => (
            <div
              key={item.id}
              className="border rounded-lg p-4 bg-white space-y-2"
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">
                    {item.period_label ?? item.period}
                  </span>
                  {statusBadge(item)}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openDetail(item)}
                  >
                    <Eye className="w-3 h-3 mr-1" /> {tCommon('details')}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={viewMutation.isPending}
                    onClick={() => viewMutation.mutate(item.id)}
                  >
                    <Eye className="w-3 h-3 mr-1" /> {t('payslipRequestView')}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={printMutation.isPending}
                    onClick={() => printMutation.mutate(item.id)}
                  >
                    <Printer className="w-3 h-3 mr-1" /> {t('payslipRequestPrint')}
                  </Button>
                </div>
              </div>
              {item.net_salary !== undefined && (
                <div className="text-sm text-muted-foreground">
                  {t('payslipNet')}: {item.net_salary.toLocaleString()}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle>{t('myPayslip')}</DialogTitle>
          </DialogHeader>
          {detailLoading ? (
            <Skeleton className="h-40" />
          ) : detail ? (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('payslipPeriod')}</span>
                <span className="font-medium">
                  {(detail as EssPayslipItem).period_label ?? (detail as EssPayslipItem).period}
                </span>
              </div>
              <Separator />
              {(detail as EssPayslipItem).gross_salary !== undefined && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('payslipGross')}</span>
                  <span className="font-medium">
                    {((detail as EssPayslipItem).gross_salary ?? 0).toLocaleString()}
                  </span>
                </div>
              )}
              {(detail as EssPayslipItem).net_salary !== undefined && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('payslipNet')}</span>
                  <span className="font-semibold text-primary">
                    {((detail as EssPayslipItem).net_salary ?? 0).toLocaleString()}
                  </span>
                </div>
              )}
              <Separator />
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={viewMutation.isPending}
                  onClick={() => {
                    if (selectedId) viewMutation.mutate(selectedId);
                  }}
                >
                  <Eye className="w-3 h-3 mr-1" /> {t('payslipRequestView')}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={printMutation.isPending}
                  onClick={() => {
                    if (selectedId) printMutation.mutate(selectedId);
                  }}
                >
                  <Printer className="w-3 h-3 mr-1" /> {t('payslipRequestPrint')}
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{tCommon('noData')}</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
