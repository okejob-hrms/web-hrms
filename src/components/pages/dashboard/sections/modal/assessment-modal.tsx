'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDashboarAssessment } from '../../hooks/assessment';
import { useTranslations } from 'next-intl';

interface AssessementModalProps {
  hook: ReturnType<typeof useDashboarAssessment>;
}

export default function AssessementModal({ hook }: AssessementModalProps) {
  const t = useTranslations('dashboard');
  const tPerf = useTranslations('performance');
  const tCommon = useTranslations('common');
  const hooks = hook;

  return (
    <Dialog open={hook.open} onOpenChange={hook.setOpen}>
      <DialogContent className="w-screen sm:max-w-3xl max-h-90 p-6 rounded-2xl bg-white overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('addCustomChartWidget')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{t('widgetLabel')}</Label>
            <Input
              type="text"
              placeholder={t('inputLabel')}
              className="w-full"
              name="label"
              value={hooks.form.label}
              onChange={(e) => {
                hooks.setForm((prev) => ({
                  ...prev,
                  label: e.target.value,
                }));
              }}
            />
          </div>

          <div className="text-lg font-bold">{t('dataSource')}</div>

          <div className="space-y-2">
            <Label>{t('dataSourceMeasurement')}</Label>

            <Select
              value={hooks.form.dataSource}
              onValueChange={(val) => {
                hooks.setForm((prev) => ({
                  ...prev,
                  dataSource: val,
                }));
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t('selectSource')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="offboarding">{t('offboarding')}</SelectItem>
                <SelectItem value="self_assessment">
                  {tPerf('selfAssessment')}
                </SelectItem>
                <SelectItem value="supervisor_assessment">
                  {tPerf('supervisorAssessment')}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t('formSource')}</Label>

            <Select
              value={hooks.form.formSource}
              onValueChange={(val) => {
                hooks.setForm((prev) => ({
                  ...prev,
                  formSource: val,
                }));
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t('selectFormSource')} />
              </SelectTrigger>
              <SelectContent>
                {hook.dataForm?.data.map((item) => (
                  <SelectItem key={item.id} value={String(item.id)}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {hook.form.formSource !== '' && !hook.loadingFormId && (
            <div className="space-y-2">
              <Label>{t('formField')}</Label>

              <div className="space-y-3">
                {hook.dataFormId?.data
                  .filter((item) =>
                    ['checkbox', 'select', 'radio'].includes(item.type),
                  )
                  .map((item) => {
                    const value = String(item.id);

                    return (
                      <label
                        key={item.id}
                        className={`flex items-center gap-3 cursor-pointer rounded-lg border border-gray-200 px-4 py-3 hover:bg-gray-50`}
                      >
                        <input
                          type="radio"
                          name="fieldId"
                          value={value}
                          checked={hooks.form.fieldId === value}
                          onChange={() => {
                            hooks.setForm((prev) => ({
                              ...prev,
                              fieldId: value,
                            }));
                          }}
                          className="accent-blue-600"
                        />

                        <span className="text-sm">{item.label}</span>
                      </label>
                    );
                  })}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>{t('rows')}</Label>

              <Select
                value={hooks.form.rows}
                onValueChange={(val) => {
                  hooks.setForm((prev) => ({
                    ...prev,
                    rows: val,
                  }));
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('selectRows')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="question">{t('question')}</SelectItem>
                  <SelectItem value="answer_option">{t('answerOption')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t('column')}</Label>

              <Select
                value={hooks.form.columns}
                onValueChange={(val) => {
                  hooks.setForm((prev) => ({
                    ...prev,
                    columns: val,
                  }));
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('selectColumns')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="question">{t('question')}</SelectItem>
                  <SelectItem value="answer_option">{t('answerOption')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t('dataSummary')}</Label>

              <Select
                value={hooks.form.dataSummary}
                onValueChange={(val) => {
                  hooks.setForm((prev) => ({
                    ...prev,
                    dataSummary: val,
                  }));
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('selectSummary')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sum">{t('sum')}</SelectItem>
                  <SelectItem value="average">{t('average')}</SelectItem>
                  <SelectItem value="max">{t('max')}</SelectItem>
                  <SelectItem value="min">{t('min')}</SelectItem>
                  <SelectItem value="count">{t('count')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t('dataVisualization')}</Label>

            <Select
              value={hooks.form.dataVisualization}
              onValueChange={(val) => {
                hooks.setForm((prev) => ({
                  ...prev,
                  dataVisualization: val,
                }));
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t('selectVisualization')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="table">{t('table')}</SelectItem>
                <SelectItem value="chart">{t('chart')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="mt-6 flex justify-end items-center w-full">
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => hook.setOpen(false)}>
              {tCommon('cancel')}
            </Button>

            <Button
              variant="default"
              onClick={() => {
                hook.onSubmit();
              }}
              disabled={hook.isPendingAddWidget}
            >
              {t('createWidget')}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
