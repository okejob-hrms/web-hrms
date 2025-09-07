"use client";

import React from "react";

export default function Dashboard() {
  return (
    <main className="flex items-center justify-center px-6 w-full rounded-md">
      <div className="flex flex-col items-center justify-center gap-6 p-10 max-w-sm w-full">
        <h1 className="text-3xl font-semibold text-gray-800">Welcome Back!</h1>

        <div className="mt-2 flex w-full justify-center">
          <div className="h-1 w-24 rounded-full bg-indigo-100" />
        </div>
      </div>
    </main>
  );
}
