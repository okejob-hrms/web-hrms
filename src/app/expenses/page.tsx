"use client";

import React from "react";
import { Clock } from "lucide-react";

export default function ComingSoon() {
  return (
    <main className="flex items-center justify-center px-6 w-full bg-white/90 rounded-md border shadow-sm border-grayscale-20">
      <div className="flex flex-col items-center justify-center gap-6 p-10 max-w-sm w-full">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-50">
          <Clock className="h-10 w-10 text-indigo-600" />
        </div>

        <h1 className="text-center text-3xl font-semibold text-gray-800">Cooming Soon!</h1>

        <p className="text-center text-sm text-gray-500">
          We are preparing something cool. Stay tuned for updates.
        </p>

        <div className="mt-2 flex w-full justify-center">
          <div className="h-1 w-24 rounded-full bg-indigo-100" />
        </div>
      </div>
    </main>
  );
}
