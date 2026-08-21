'use client';

import * as React from 'react';
import { Download, FileSpreadsheet, ImageIcon, Plus } from 'lucide-react';
import { toPng } from 'html-to-image';
import {
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import AssessementModal from './modal/assessment-modal';
import { useDashboarAssessment } from '../hooks/assessment';
import { DashboardSummaryItem } from '@/services/dashboard/types';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type ChartDatum = { label: string; value: number };

const VALUE_DECIMALS = 2;

const toNumber = (value: string | number) => {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
};

const formatValue = (value: number) =>
  Number.isInteger(value)
    ? String(value)
    : value.toFixed(VALUE_DECIMALS);

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'widget';

/**
 * Prefer API `rows_mode`:
 * - question → rows=labels, columns=values
 * - answer_option → rows=values, columns=labels
 * Fallback keeps legacy payloads readable without guessing from numeric content.
 */
const mapToChartData = (item: DashboardSummaryItem): ChartDatum[] => {
  const rowCount = item.rows.length;
  const colCount = item.columns.length;
  const len = Math.max(rowCount, colCount);
  const valuesAreRows = item.rows_mode === 'answer_option';

  return Array.from({ length: len }, (_, index) => {
    if (valuesAreRows) {
      return {
        label: String(item.columns[index] ?? ''),
        value: toNumber(item.rows[index] ?? 0),
      };
    }

    return {
      label: String(item.rows[index] ?? ''),
      value: toNumber(item.columns[index] ?? 0),
    };
  });
};

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

const exportCsv = (label: string, data: ChartDatum[]) => {
  const escape = (cell: string) => `"${cell.replace(/"/g, '""')}"`;
  const lines = [
    'Label,Value',
    ...data.map(
      (row) => `${escape(row.label)},${formatValue(row.value)}`,
    ),
  ];
  downloadBlob(
    new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' }),
    `${slugify(label)}.csv`,
  );
};

const ChartBar = ({ data }: { data: ChartDatum[] }) => {
  return (
    <div className="h-[280px] w-full min-h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <ReBarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
          <XAxis
            dataKey="label"
            stroke="#6b7280"
            tickLine={false}
            interval={0}
            angle={-25}
            textAnchor="end"
            height={70}
            tick={{ fontSize: 11, fill: '#9ca3af' }}
          />
          <YAxis
            stroke="#6b7280"
            tickLine={false}
            tick={{ fontSize: 13, fill: '#9ca3af' }}
            tickFormatter={(v) => formatValue(Number(v))}
          />
          <Tooltip
            formatter={(value) => formatValue(Number(value ?? 0))}
          />
          <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="#C964A2" />
        </ReBarChart>
      </ResponsiveContainer>
    </div>
  );
};

const ChartTable = ({
  data,
  labelHeader,
  valueHeader,
}: {
  data: ChartDatum[];
  labelHeader: string;
  valueHeader: string;
}) => {
  return (
    <div className="w-full overflow-x-auto px-2 pb-2">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-border bg-gray-100/40">
            <th className="w-1/2 px-3 py-3 text-left font-bold">{labelHeader}</th>
            <th className="w-1/2 px-3 py-3 text-left font-bold">{valueHeader}</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={`${row.label}-${index}`} className="border-b border-border/60 last:border-b-0">
              <td className="px-3 py-3 align-top break-words">{row.label}</td>
              <td className="px-3 py-3 align-top tabular-nums whitespace-nowrap">
                {formatValue(row.value)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const WidgetCard = ({ item }: { item: DashboardSummaryItem }) => {
  const t = useTranslations('dashboard');
  const cardRef = React.useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = React.useState(false);
  const chartData = React.useMemo(() => mapToChartData(item), [item]);
  const isTable = item.visualization === 'table';

  const handleExportCsv = () => {
    try {
      exportCsv(item.label, chartData);
      toast.success(t('exportCsvSuccess'));
    } catch {
      toast.error(t('exportFailed'));
    }
  };

  const handleExportPng = async () => {
    if (!cardRef.current) return;
    setExporting(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        backgroundColor: '#ffffff',
        pixelRatio: 2,
        filter: (node) => {
          if (!(node instanceof HTMLElement)) return true;
          return !node.dataset.exportIgnore;
        },
      });
      const a = document.createElement('a');
      a.download = `${slugify(item.label)}.png`;
      a.href = dataUrl;
      a.click();
      toast.success(t('exportPngSuccess'));
    } catch {
      toast.error(t('exportFailed'));
    } finally {
      setExporting(false);
    }
  };

  return (
    <div
      ref={cardRef}
      className={`flex flex-col rounded-xl bg-white p-2 shadow-sm ${
        isTable ? 'min-h-[240px] h-auto' : 'h-[380px]'
      }`}
    >
      <div className="mb-2 flex items-start justify-between gap-2 p-4 pb-2">
        <div className="min-w-0 flex-1">
          <div className="font-semibold break-words">{item.label}</div>
          {item.scale === '0-5' && (
            <div className="mt-0.5 text-xs text-muted-foreground">
              {t('scaleHint05')}
            </div>
          )}
        </div>
        <div data-export-ignore="true" className="shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={exporting}
                className="gap-1.5"
              >
                <Download className="size-4" />
                {t('export')}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExportCsv}>
                <FileSpreadsheet className="size-4" />
                {t('exportCsv')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportPng}>
                <ImageIcon className="size-4" />
                {t('exportPng')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className={`min-h-0 flex-1 ${isTable ? '' : 'overflow-hidden'}`}>
        {isTable ? (
          <ChartTable
            data={chartData}
            labelHeader={t('tableLabel')}
            valueHeader={t('tableValue')}
          />
        ) : (
          <ChartBar data={chartData} />
        )}
      </div>
    </div>
  );
};

export const Assessment = () => {
  const hooks = useDashboarAssessment();
  const t = useTranslations('dashboard');

  return (
    <div className="flex min-h-screen flex-col space-y-6 py-6 font-sans">
      <div className="mt-5 grid grid-cols-1 gap-6 md:grid-cols-2">
        {hooks.dataWidget?.data.map((item, i) => (
          <WidgetCard key={`${item.label}-${i}`} item={item} />
        ))}

        <div
          className="flex h-[380px] cursor-pointer flex-col items-center justify-center space-y-2 rounded-xl border border-primary bg-primary/10"
          onClick={() => hooks.setOpen(true)}
        >
          <Plus size={38} className="text-primary" />
          <div className="font-semibold text-primary">
            {t('addCustomChartWidgetCard')}
          </div>
          <div className="px-6 text-center text-sm text-gray-600">
            {t('addCustomChartWidgetHint')}
          </div>
        </div>
      </div>

      <AssessementModal hook={hooks} />
    </div>
  );
};
