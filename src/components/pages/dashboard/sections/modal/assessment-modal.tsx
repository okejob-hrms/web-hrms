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
      <DialogContent className="flex w-screen max-h-[90vh] flex-col gap-0 overflow-hidden rounded-2xl bg-white p-0 sm:max-w-3xl">
        <DialogHeader className="shrink-0 border-b px-6 py-4 pr-12">
          <DialogTitle>{t('addCustomChartWidget')}</DialogTitle>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-4">
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
                hooks.setDataSource(val);
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
                  fieldId: '',
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

              {hook.selectableFields.length === 0 ? (
                <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  {t('noSelectableFormFields')}
                </p>
              ) : (
                <div className="max-h-48 space-y-3 overflow-y-auto pr-1">
                  {hook.selectableFields.map((item) => {
                    const value = String(item.id);

                    return (
                      <label
                        key={item.id}
                        className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 hover:bg-gray-50"
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

                        <span className="text-sm">
                          {item.label}
                          <span className="ml-2 text-xs text-muted-foreground">
                            ({item.type})
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {!hooks.isOffboarding && (
              <>
                <div className="space-y-2 md:col-span-2">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
                          <SelectItem value="answer_option">
                            {t('answerOption')}
                          </SelectItem>
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
                          <SelectItem value="answer_option">
                            {t('answerOption')}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {hooks.form.rows &&
                    hooks.form.columns &&
                    hooks.form.rows === hooks.form.columns && (
                      <p className="text-xs text-amber-700">
                        {t('distinctAxesRequired')}
                      </p>
                    )}
                </div>
              </>
            )}

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
              {hooks.isOffboarding &&
                ['checkbox', 'select', 'radio'].includes(
                  hook.selectableFields.find(
                    (f) => String(f.id) === hooks.form.fieldId,
                  )?.type ?? '',
                ) && (
                <p className="text-xs text-muted-foreground">
                  {t('offboardingSummaryHint')}
                </p>
              )}
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

        <DialogFooter className="shrink-0 border-t px-6 py-4">
          <div className="flex w-full justify-end gap-3">
            <Button variant="outline" onClick={() => hook.setOpen(false)}>
              {tCommon('cancel')}
            </Button>

            <Button
              variant="default"
              onClick={() => {
                hook.onSubmit();
              }}
              disabled={hook.isPendingAddWidget || !hook.canSubmit}
            >
              {t('createWidget')}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
