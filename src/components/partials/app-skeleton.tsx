"use client";

import { Skeleton } from "@/components/ui/skeleton";

export default function AppSkeleton() {
  return (
    <div className="z-[9999]">
      <div className="space-y-4">
        {/* Header skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-8" />
          <div className="h-8" />
          <Skeleton className="h-8" />
        </div>

        {/* Grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32 col-span-2" />
        </div>

        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          <Skeleton className="h-5" />
          <Skeleton className="h-5 col-span-2" />
          <Skeleton className="h-5" />
          <Skeleton className="h-5 col-span-2" />
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          <Skeleton className="h-5" />
          <Skeleton className="h-5" />
          <Skeleton className="h-5 col-span-2" />
          <Skeleton className="h-5" />
          <Skeleton className="h-5" />
        </div>

        {/* Grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-56" />
          <Skeleton className="h-56" />
        </div>
      </div>
    </div>
  );
}
