'use client';

import { InputForm } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Search } from 'lucide-react';
import * as React from 'react';
// import { MultiSelectForm } from '@/components/ui/multi-select';
import { Filters } from '../types';
import { AdvancedFilter } from './advanced-filters';
import { useForm } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { DatePicker } from '@/components/ui/date-picker';

interface ToolbarProps {
  onFiltersChange: (filters: Filters) => void;
}

export const Toolbar = React.memo(function Toolbar({
  onFiltersChange,
}: ToolbarProps) {
  const initValues = {
    date: '',
    search: '',
  };
  const [isAdvanced, setIsAdvanced] = React.useState(false);
  const form = useForm<Filters>({
    defaultValues: initValues,
    mode: 'onChange',
  });

  const debouncedSubmit = React.useRef<NodeJS.Timeout | null>(null);

  const onSubmit = React.useCallback(
    (values: Filters) => {
      console.log('Basic filter submit:', values);
      onFiltersChange({
        ...values,
      });
    },
    [onFiltersChange],
  );

  React.useEffect(() => {
    if (debouncedSubmit.current) {
      clearTimeout(debouncedSubmit.current);
    }

    if (form.formState.isDirty) {
      debouncedSubmit.current = setTimeout(() => {
        form.handleSubmit(onSubmit)();
      }, 300);
    }

    return () => {
      if (debouncedSubmit.current) {
        clearTimeout(debouncedSubmit.current);
      }
    };
  }, [form, onSubmit]);

  const handleAdvancedFilters = (filters: Filters) => {
    console.log('Advanced filters applied:', filters);
    onFiltersChange(filters);
  };

  const handleAdvancedReset = () => {
    setIsAdvanced(false);
    form.reset(initValues);
    onFiltersChange(initValues);
  };

  const handleSearchKeyPress = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        form.handleSubmit(onSubmit)();
      }
    },
    [form, onSubmit],
  );

  if (isAdvanced)
    return (
      <AdvancedFilter
        onReset={handleAdvancedReset}
        onApplyFilters={handleAdvancedFilters}
      />
    );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex flex-col md:flex-row md:items-end gap-2 md:h-10">
          <InputForm
            name="search"
            placeholder="Search by Employee Name or Email"
            icon={<Search className="size-5 text-grayscale-20" />}
            iconPosition="right"
            onKeyDown={handleSearchKeyPress}
          />
          <Separator orientation="vertical" />
          <DatePicker name="date" label="" />
        </div>
      </form>
    </Form>
  );
});
