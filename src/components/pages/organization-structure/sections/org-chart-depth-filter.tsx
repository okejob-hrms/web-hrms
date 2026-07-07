'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { SearchableSelect } from '@/components/ui/combobox';

const DEPTH_LEVELS = [1, 2, 3, 4, 5] as const;
const ALL_DEPTH_VALUE = 'all';

interface OrgChartDepthFilterProps {
  value: number | null;
  onChange: (depth: number | null) => void;
  className?: string;
}

export function OrgChartDepthFilter({
  value,
  onChange,
  className,
}: OrgChartDepthFilterProps) {
  const t = useTranslations('employee');

  const options = useMemo(
    () => [
      { value: ALL_DEPTH_VALUE, label: t('orgChartDepthAll') },
      ...DEPTH_LEVELS.map((level) => ({
        value: String(level),
        label: t('orgChartDepthLevel', { count: level }),
      })),
    ],
    [t],
  );

  const selectValue = value == null ? ALL_DEPTH_VALUE : String(value);

  return (
    <SearchableSelect
      value={selectValue}
      onValueChange={(nextValue) => {
        if (!nextValue || nextValue === ALL_DEPTH_VALUE) {
          onChange(null);
          return;
        }
        onChange(Number(nextValue));
      }}
      options={options}
      placeholder={t('orgChartDepth')}
      allowClear={false}
      className={className ?? 'w-[200px] bg-white'}
      popoverClassName="w-[200px]"
    />
  );
}
