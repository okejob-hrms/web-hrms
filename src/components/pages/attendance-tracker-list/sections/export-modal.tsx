'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import dayjs from 'dayjs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Download } from 'lucide-react';
import { exportAttendanceExcel } from '@/services/attendance';
import { getBranchesAll } from '@/services/settings';
import {
  DEFAULT_INDONESIA_TIMEZONE,
  todayInIndonesiaTimezone,
} from '@/lib/indonesia-timezone';

interface Props {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  defaultStartDate?: string;
  defaultEndDate?: string;
}

export default function AttendanceExportModal({
  isOpen,
  setIsOpen,
  defaultStartDate,
  defaultEndDate,
}: Props) {
  const t = useTranslations('attendance');
  const tCommon = useTranslations('common');
  const [anchorToday, setAnchorToday] = React.useState(() =>
    todayInIndonesiaTimezone(DEFAULT_INDONESIA_TIMEZONE),
  );

  const [startDate, setStartDate] = React.useState(
    defaultStartDate || anchorToday,
  );
  const [endDate, setEndDate] = React.useState(defaultEndDate || anchorToday);
  const [isExporting, setIsExporting] = React.useState(false);

  React.useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;
    (async () => {
      try {
        const res = await getBranchesAll();
        const primary = res.data?.find((b) => b.is_primary);
        const tz =
          primary?.timezone ||
          primary?.settings?.timezone ||
          DEFAULT_INDONESIA_TIMEZONE;
        const today = todayInIndonesiaTimezone(tz);
        if (!cancelled) {
          setAnchorToday(today);
          setStartDate(defaultStartDate || today);
          setEndDate(defaultEndDate || today);
        }
      } catch {
        const today = todayInIndonesiaTimezone(DEFAULT_INDONESIA_TIMEZONE);
        if (!cancelled) {
          setAnchorToday(today);
          setStartDate(defaultStartDate || today);
          setEndDate(defaultEndDate || today);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isOpen, defaultStartDate, defaultEndDate]);

  const handleExport = async () => {
    if (!startDate || !endDate) {
      toast.error(t('exportDateRequired'));
      return;
    }

    if (dayjs(endDate).isBefore(dayjs(startDate), 'day')) {
      toast.error(t('exportDateInvalid'));
      return;
    }

    if (dayjs(endDate).diff(dayjs(startDate), 'day') + 1 > 31) {
      toast.error(t('exportDateRangeTooLong'));
      return;
    }

    setIsExporting(true);
    try {
      const blob = await exportAttendanceExcel({
        start_date: startDate,
        end_date: endDate,
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download =
        startDate === endDate
          ? `attendance-${startDate}.xlsx`
          : `attendance-${startDate}_to_${endDate}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success(t('exportExcelSuccess'));
      setIsOpen(false);
    } catch (error: unknown) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : t('exportExcelFailed');
      toast.error(message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle>{t('exportExcel')}</DialogTitle>
          <DialogDescription>{t('exportExcelDescription')}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="export-start-date">{t('startDate')}</Label>
            <Input
              id="export-start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="export-end-date">{t('endDate')}</Label>
            <Input
              id="export-end-date"
              type="date"
              value={endDate}
              min={startDate}
              max={anchorToday}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isExporting}
          >
            {tCommon('cancel')}
          </Button>
          <Button type="button" onClick={handleExport} disabled={isExporting}>
            <Download className="h-4 w-4" />
            {isExporting ? tCommon('processing') : t('exportExcel')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
