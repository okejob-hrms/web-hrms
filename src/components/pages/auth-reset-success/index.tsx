"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ResetSuccessPage() {
  const router = useRouter();
  const t = useTranslations("auth");
  const tCommon = useTranslations("common");

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col justify-center px-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm font-medium mb-6"
      >
        <ArrowLeft className="h-5 w-5" /> {tCommon("back")}
      </button>

      <h1 className="text-2xl font-bold mb-1">{t("resetSuccess")}</h1>
      <p className="text-muted-foreground mb-6">{t("resetSuccessSubtitle")}</p>

      <Button
        type="button"
        className="w-full"
        onClick={() => router.push("/auth/login")}
      >
        {tCommon("continue")}
      </Button>
    </div>
  );
}
