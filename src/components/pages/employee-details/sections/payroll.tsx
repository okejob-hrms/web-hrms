import { Clock } from "lucide-react";
import * as React from "react";

export const PayrollDetail = React.memo(function PayrollDetail() {
  return (
    <div className="flex flex-col w-full gap-2 p-2">
      <h1 className="font-semibold text-lg">Payroll</h1>
      <div className="flex flex-col items-center justify-center gap-6 p-10 w-full">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-50">
          <Clock className="h-10 w-10 text-indigo-600" />
        </div>

        <h1 className="text-center text-3xl font-semibold text-gray-800">
          Cooming Soon!
        </h1>

        <p className="text-center text-sm text-gray-500">
          We are preparing something cool. Stay tuned for updates.
        </p>

        <div className="mt-2 flex w-full justify-center">
          <div className="h-1 w-24 rounded-full bg-indigo-100" />
        </div>
      </div>
    </div>
  );
});
