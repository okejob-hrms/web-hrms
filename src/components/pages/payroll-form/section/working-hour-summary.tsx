'use client';

type WorkingHourSummaryProps = {
  regularHour: number;
  overtimeHour: number;
};

export default function WorkingHourSummary({
  regularHour,
  overtimeHour,
}: WorkingHourSummaryProps) {
  const total = regularHour + overtimeHour;
  const regularPercent = (regularHour / total) * 100;
  const overtimePercent = (overtimeHour / total) * 100;

  return (
    <div className="w-full">
      {/* Title */}
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Working Hour Summary
      </h2>

      {/* Hours */}
      <div className="flex justify-between text-sm font-medium mb-2">
        <div>
          <span className="text-3xl font-bold text-black">{regularHour}</span>
          <span className="text-gray-500 ml-1">Hours</span>
        </div>
        <div className="text-right">
          <span className="text-3xl font-bold text-black">{overtimeHour}</span>
          <span className="text-gray-500 ml-1">Hours</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="flex w-full h-4 overflow-hidden rounded-full bg-gray-200">
        <div
          className="bg-sky-300 h-full"
          style={{ width: `${regularPercent}%` }}
        />
        <div
          className="bg-amber-400 h-full"
          style={{ width: `${overtimePercent}%` }}
        />
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-sm bg-sky-300"></span>
          Regular Hour
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-sm bg-amber-400"></span>
          Overtime
        </div>
      </div>
    </div>
  );
}
