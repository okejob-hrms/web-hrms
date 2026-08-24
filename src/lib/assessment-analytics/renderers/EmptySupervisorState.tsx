"use client";

import { useTranslations } from "next-intl";

export function EmptySupervisorState() {
  const t = useTranslations("dashboard");

  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/50 px-8 text-center">
      <div className="text-base font-semibold">
        {t("analyticsEmptySupervisorTitle")}
      </div>
      <p className="max-w-md text-sm text-muted-foreground">
        {t("analyticsEmptySupervisorBody")}
      </p>
    </div>
  );
}
