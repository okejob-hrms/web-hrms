'use client';

import { useOKRDashboard } from './hook';
import { OKRKeyResultCard } from './graph-card';

export default function OKRChartsSection() {
  const { objectives, isLoading } = useOKRDashboard();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-8">
      {objectives.map((obj) => (
        <div key={obj.id}>
          <h3 className="text-lg font-semibold my-4">{obj.name}</h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {obj.keyResults.map((kr) => (
              <OKRKeyResultCard key={kr.id} kr={kr} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
