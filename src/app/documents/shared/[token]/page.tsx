"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { FileText } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { getSharedDocument } from "@/services/document/access-control";
import { getPublicFileUrl } from "@/lib/helpers";

export default function SharedDocumentPage() {
  const params = useParams<{ token: string }>();
  const token = params?.token;
  const t = useTranslations("employee");
  const tCommon = useTranslations("common");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["shared-document", token],
    queryFn: () => getSharedDocument(token!),
    enabled: !!token,
    retry: false,
  });

  const doc = data?.data;
  const url = getPublicFileUrl(doc?.url || doc?.path);

  if (isLoading) {
    return (
      <main className="flex min-h-[50vh] items-center justify-center p-6">
        <p className="text-sm text-text-disabled">{tCommon("loading")}</p>
      </main>
    );
  }

  if (isError || !doc) {
    return (
      <main className="flex min-h-[50vh] items-center justify-center p-6">
        <div className="text-center space-y-2">
          <FileText className="mx-auto h-10 w-10 text-gray-400" />
          <h1 className="text-lg font-semibold">{t("sharedDocumentNotFound")}</h1>
          <p className="text-sm text-text-disabled">
            {t("sharedDocumentNotFoundDesc")}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-[50vh] items-center justify-center p-6">
      <div className="w-full max-w-md rounded-md border bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-start gap-3">
          <FileText className="h-8 w-8 text-primary shrink-0" />
          <div className="min-w-0">
            <h1 className="font-semibold truncate" title={doc.filename}>
              {doc.filename}
            </h1>
            <p className="text-xs text-text-disabled mt-1">
              {doc.type}
              {doc.uploaded_by?.name
                ? ` · ${t("uploadedBy")} ${doc.uploaded_by.name}`
                : ""}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            className="flex-1"
            onClick={() => window.open(url, "_blank", "noopener,noreferrer")}
            disabled={!url}
          >
            {t("openDocument")}
          </Button>
          <Button type="button" variant="outline" className="flex-1" asChild>
            <a href={url} download={doc.filename}>
              {tCommon("download")}
            </a>
          </Button>
        </div>
      </div>
    </main>
  );
}
