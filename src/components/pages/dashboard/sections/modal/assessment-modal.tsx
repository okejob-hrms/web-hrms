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

interface AssessementModalProps {
  hook: ReturnType<typeof useDashboarAssessment>;
}

export default function AssessementModal({ hook }: AssessementModalProps) {
  const hooks = hook;

  return (
    <Dialog open={hook.open} onOpenChange={hook.setOpen}>
      <DialogContent className="w-screen sm:max-w-3xl max-h-90 p-6 rounded-2xl bg-white overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Custom Chart Widget</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Label</Label>
            <Input
              type="text"
              placeholder="Input label"
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

          {/* Data Source */}
          <div className="text-lg font-bold">Data Source</div>

          <div className="space-y-2">
            <Label>Data Source Measurement</Label>

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
                <SelectValue placeholder="Select source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="offboarding">Offboarding</SelectItem>
                <SelectItem value="self_assessment">Self Assessment</SelectItem>
                <SelectItem value="supervisor_assessment">
                  Supervisor Assessment
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Form Source</Label>

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
                <SelectValue placeholder="Select form source" />
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
              <Label>Form Field</Label>

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
              <Label>Rows</Label>

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
                  <SelectValue placeholder="Select rows" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="question">Question</SelectItem>
                  <SelectItem value="answer_option">Answer Option</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Column</Label>

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
                  <SelectValue placeholder="Select columns" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="question">Question</SelectItem>
                  <SelectItem value="answer_option">Answer Option</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Data Summary</Label>

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
                  <SelectValue placeholder="Select summary" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sum">SUM</SelectItem>
                  <SelectItem value="average">AVERAGE</SelectItem>
                  <SelectItem value="max">MAX</SelectItem>
                  <SelectItem value="min">MIN</SelectItem>
                  <SelectItem value="count">COUNT</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Data Visualization</Label>

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
                <SelectValue placeholder="Select visualization" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="table">Table</SelectItem>
                <SelectItem value="chart">Chart</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="mt-6 flex justify-end items-center w-full">
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => hook.setOpen(false)}>
              Cancel
            </Button>

            <Button
              variant="default"
              onClick={() => {
                hook.onSubmit();
              }}
              disabled={hook.isPendingAddWidget}
            >
              Create
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
