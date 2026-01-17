import { ComposedChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Bar, CartesianGrid } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { KeyResultFilter } from './kr-filter';
import { useOKRKeyResultFilter } from './useOkrKeyResultFilter';
import React from 'react';

interface Props {
  cycleId: number,
  kr: {
    id: number;
    name: string;
    frequencyCode: number;
    frequency: string;
    averageActual: number;
    averageTarget: number;
    chartData: {
      label: string;
      value: number;
      target: number;
    }[];
  };
}

export function OKRKeyResultCard({ kr, cycleId }: Props) {
  const { filteredData, isLoading, setFilters } = useOKRKeyResultFilter(cycleId, kr.id);

  const displayData = React.useMemo(() => {
    if (!filteredData) return kr.chartData;
    
    return filteredData.labels.map((label: string, index: number) => ({
      label,
      value: Number(filteredData.data[index]) || 0,
      target: filteredData.target_value,
    }));
  }, [filteredData, kr.chartData]);

  const averages = React.useMemo(() => {
    if (!filteredData) return { actual: kr.averageActual, target: kr.averageTarget };
    return {
      actual: filteredData.average_actual_value,
      target: filteredData.average_target_value
    };
  }, [filteredData, kr]);

  return (
    <Card className="rounded-xl border border-gray-100 shadow-sm bg-white overflow-hidden">
      <CardHeader className="p-5 space-y-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="text-[14px] font-bold text-[#2D3748] leading-tight">
              {kr.name}
            </CardTitle>
            <p className="text-[10px] text-gray-400">
              Last Update 12/12/2025 05:00 PM
            </p>
          </div>
        </div>

        <KeyResultFilter 
          frequencyCode={kr.frequencyCode} 
          onFilterChange={(params) => setFilters(params)} 
        />

        <div className="flex gap-8 pt-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-[2px] bg-[#C86AA4]" />
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-400 font-medium">Avg. Actual</span>
              <span className="text-sm font-bold text-[#2D3748]">{averages.actual}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-[2px] bg-[#2B6CB0]" />
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-400 font-medium">Avg. Target</span>
              <span className="text-sm font-bold text-[#2D3748]">{averages.target}</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className={`h-[220px] px-2 pb-4 transition-opacity ${isLoading ? 'opacity-40' : 'opacity-100'}`}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={displayData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#F7FAFC" />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 9, fill: '#A0AEC0' }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 9, fill: '#A0AEC0' }}
            />
            <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            />
            <Bar
              dataKey="value"
              fill="#C86AA4"
              barSize={16}
              radius={[2, 2, 0, 0]}
            />
            <Line
              type="monotone"
              dataKey="target"
              stroke="#2B6CB0"
              strokeWidth={2}
              dot={{ r: 2, fill: '#2B6CB0', strokeWidth: 1 }}
              activeDot={{ r: 4 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}