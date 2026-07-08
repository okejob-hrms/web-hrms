import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { InputForm } from '@/components/ui/input';
import { SelectForm } from '@/components/ui/select-form';
import { MultiSelectForm } from '@/components/ui/multi-select';
import {
  IKPIDetails,
  IMutateKPIRequest,
} from '@/services/performances/kpi/types';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { z } from 'zod';

type KPIFormValues = {
  name: string;
  description: string;
  frequency: string;
  format: string;
  job_position_ids: number[];
  job_level_ids: number[];
  target?: string;
  direction?: string;
  aggregation: string;
};

interface IOption {
  label: string;
  value: string;
}

interface FormAddModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: IMutateKPIRequest) => void;
  frequencyOptions: IOption[];
  formatOptions: IOption[];
  jobPositionOptions: IOption[];
  jobLevelOptions: IOption[];
  aggregationOptions: IOption[];
  directionOptions: IOption[];
  kpiDetails?: IKPIDetails;
  editMode: boolean;
  isLoadingDetails?: boolean;
}

export default function FormModal({
  open,
  onOpenChange,
  onSave,
  frequencyOptions,
  formatOptions,
  jobPositionOptions,
  jobLevelOptions,
  aggregationOptions,
  directionOptions,
  kpiDetails,
  editMode,
  isLoadingDetails,
}: FormAddModalProps) {
  const t = useTranslations('performance');
  const tCommon = useTranslations('common');

  const kpiFormSchema = React.useMemo(
    () =>
      z.object({
        name: z.string().min(1, t('kpiNameRequired')),
        description: z.string().min(1, t('descriptionRequired')),
        frequency: z.string().min(1, t('frequencyRequired')),
        format: z.string().min(1, t('formatRequired')),
        job_position_ids: z
          .array(z.number())
          .min(1, t('jobPositionRequired')),
        job_level_ids: z.array(z.number()).min(1, t('jobLevelRequired')),
        target: z.string().optional(),
        direction: z.string().optional(),
        aggregation: z.string().min(1, t('kpiAggregationRequired')),
      }),
    [t],
  );

  const form = useForm<KPIFormValues>({
    resolver: zodResolver(kpiFormSchema),
    defaultValues: {
      name: '',
      description: '',
      frequency: '',
      format: '',
      job_position_ids: [],
      job_level_ids: [],
      target: '',
      direction: '',
      aggregation: '',
    },
  });

  React.useEffect(() => {
    if (editMode && kpiDetails && open) {
      form.reset({
        name: kpiDetails.name || '',
        description: kpiDetails.description || '',
        frequency: kpiDetails.frequency?.toString() || '',
        format: kpiDetails.format?.toString() || '',
        job_position_ids: kpiDetails.job_position_ids || [],
        job_level_ids: kpiDetails.job_level_ids || [],
        target: kpiDetails.target?.toString() || '',
        direction: kpiDetails.direction?.toString() || '',
        aggregation: kpiDetails.aggregation?.toString() || '',
      });
    } else if (!editMode && open) {
      form.reset({
        name: '',
        description: '',
        frequency: '',
        format: '',
        job_position_ids: [],
        job_level_ids: [],
        target: '',
        direction: '',
        aggregation: '',
      });
    }
  }, [editMode, kpiDetails, open, form]);

  const handleSave = (formData: KPIFormValues): void => {
    const data: IMutateKPIRequest = {
      name: formData.name,
      description: formData.description,
      frequency: Number(formData.frequency),
      format: Number(formData.format),
      job_position_ids: formData.job_position_ids,
      job_level_ids: formData.job_level_ids,
      target: formData.target ? Number(formData.target) : 0,
      direction: formData.direction ? Number(formData.direction) : 0,
      aggregation: Number(formData.aggregation),
    };
    onSave(data);
    handleClose();
  };

  const handleClose = (): void => {
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          handleClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto p-0 bg-white">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-xl font-semibold">
            {editMode ? t('editKpi') : t('createNewKpi')}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form className="px-6 pb-6 space-y-5">
            <p className="font-semibold">{t('kpiInformation')}</p>
            <InputForm
              name="name"
              label={t('kpiName')}
              required
              className="w-full"
            />
            <InputForm
              name="description"
              label={tCommon('description')}
              required
              className="w-full"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full items-start">
              <SelectForm
                name="frequency"
                label={t('frequency')}
                required
                options={frequencyOptions}
              />
              <SelectForm
                name="format"
                label={t('format')}
                required
                options={formatOptions}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm text-text-secondary">
                {t('jobPosition')}
                <span className="text-error">*</span>
              </label>
              <MultiSelectForm
                options={jobPositionOptions}
                name="job_position_ids"
                maxCount={3}
                searchPlaceholder={t('searchJobPosition')}
                hideSelectAll
                valueTransformer={(value) => Number(value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm text-text-secondary">
                {t('jobLevel')}
                <span className="text-error">*</span>
              </label>
              <MultiSelectForm
                options={jobLevelOptions}
                name="job_level_ids"
                maxCount={3}
                searchPlaceholder={t('searchJobLevel')}
                hideSelectAll
                valueTransformer={(value) => Number(value)}
              />
            </div>
            <p className="font-semibold">{t('kpiTargetSection')}</p>
            <InputForm
              name="target"
              label={t('target')}
              isOptional
              className="w-full"
            />
            <SelectForm
              name="direction"
              label={t('direction')}
              isOptional
              className="w-full"
              options={directionOptions}
            />
            <SelectForm
              name="aggregation"
              label={t('kpiAggregation')}
              required
              className="w-full"
              options={aggregationOptions}
            />
            <div className="flex md:flex-row flex-col md:justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="px-6 border-[#0e7490] text-[#0e7490] hover:bg-[#0e7490]/5"
              >
                {tCommon('cancel')}
              </Button>
              <Button
                type="button"
                onClick={form.handleSubmit(handleSave)}
                disabled={isLoadingDetails && editMode}
                className="px-8 bg-[#0e7490] hover:bg-[#0c6380] text-white"
              >
                {editMode ? t('updateKpi') : t('createKpi')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
