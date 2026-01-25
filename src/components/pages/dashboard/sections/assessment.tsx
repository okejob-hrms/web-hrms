'use client';

import * as React from 'react';
import { Plus } from 'lucide-react';
import {
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

import AssessementModal from './modal/assessment-modal';
import { useDashboarAssessment } from '../hooks/assessment';

/* ============================================================================
 * Helper: map API data -> chart data
 * ============================================================================
 */
const mapToChartData = (item: { rows: string[]; columns: number[] }) => {
  return item.rows.map((row, index) => ({
    label: row,
    value: item.columns[index] ?? 0,
  }));
};

/* ============================================================================
 * Inline Chart Component
 * ============================================================================
 */
const ChartBar = ({ data }: { data: { label: string; value: number }[] }) => {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <ReBarChart data={data}>
        <XAxis
          dataKey="label"
          stroke="#6b7280"
          tickLine={false}
          tick={{ fontSize: 13, fill: '#9ca3af' }}
        />
        <YAxis
          stroke="#6b7280"
          tickLine={false}
          allowDecimals={false}
          tick={{ fontSize: 13, fill: '#9ca3af' }}
        />
        <Tooltip />
        <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="#C964A2" />
      </ReBarChart>
    </ResponsiveContainer>
  );
};

/* ============================================================================
 * Main Component
 * ============================================================================
 */
export const Assessment = () => {
  const hooks = useDashboarAssessment();

  return (
    <div className="font-sans min-h-screen flex flex-col space-y-6 py-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-5">
        {hooks.dataWidget?.data.map((item, i) => {
          const chartData = mapToChartData(item);

          return (
            <div
              key={i}
              className="bg-white rounded-xl p-2 h-[380px] flex flex-col"
            >
              {/* Chart Title */}
              <div className="font-semibold mb-2 p-4">{item.label}</div>

              {/* Chart */}
              <ChartBar data={chartData} />
            </div>
          );
        })}

        {/* Add Widget Card */}
        <div
          className="h-[380px] bg-primary/10 border border-primary flex flex-col items-center justify-center space-y-2 rounded-xl cursor-pointer"
          onClick={() => hooks.setOpen(true)}
        >
          <Plus size={38} className="text-primary" />
          <div className="text-primary font-semibold">
            Add Custom Chart Widget
          </div>
          <div className="text-sm text-gray-600 text-center px-6">
            Turn your data into insights by creating a chart widget
          </div>
        </div>
      </div>

      <AssessementModal
        onOpenChange={hooks.setOpen}
        open={hooks.open}
        hook={hooks}
      />
    </div>
  );
};
