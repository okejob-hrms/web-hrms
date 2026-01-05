import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Bar,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  kr: {
    id: number;
    name: string;
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

export function OKRKeyResultCard({ kr }: Props) {
  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="text-sm">{kr.name}</CardTitle>
        <p className="text-xs text-muted-foreground">
          {kr.frequency} • Avg {kr.averageActual}/{kr.averageTarget}
        </p>
      </CardHeader>

      <CardContent className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={kr.chartData}>
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
              width={30}
            />
            <Tooltip />
            <Bar
              dataKey="value"
              barSize={24}
              radius={[3, 3, 0, 0]}
              fill="#C86AA4"
            />
            <Line type="monotone" dataKey="target" strokeDasharray="4 4" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
