"use client";

export function EmptySupervisorState() {
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/50 px-8 text-center">
      <div className="text-base font-semibold">
        Belum ada siklus penilaian atasan yang selesai
      </div>
      <p className="max-w-md text-sm text-muted-foreground">
        Distribusi grade dari Penilaian Atasan baru muncul setelah submission
        digabung (status Merged). Sumber nilai ini kosong saat ini — itu
        perilaku yang benar, bukan error.
      </p>
    </div>
  );
}
