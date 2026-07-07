/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Paperclip, Loader2, Download, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  downloadImportTemplate,
  processImport,
  getImportReport,
  IImportReportResponse,
} from "@/services/employees/import-service";
import { toast } from "sonner";
import { ImportPreviewTable } from "./import-preview-table";
import { useTranslations } from "next-intl";

interface EmployeeImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EmployeeImportDialog({
  open,
  onOpenChange,
}: EmployeeImportDialogProps) {
  const t = useTranslations("employee");
  const tCommon = useTranslations("common");
  const [step, setStep] = React.useState<"upload" | "result">("upload");
  const [file, setFile] = React.useState<File | null>(null);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [isDownloading, setIsDownloading] = React.useState(false);
  const [report, setReport] = React.useState<IImportReportResponse["data"] | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      await handleUpload(selectedFile);
    }
  };

  const handleUpload = async (selectedFile: File) => {
    setFile(selectedFile);
    setIsProcessing(true);
    setStep("upload");
    
    try {
      const processRes = await processImport(selectedFile);
      const importId = processRes.data.import_id;
      
      let isCompleted = false;
      while (!isCompleted) {
        await new Promise((res) => setTimeout(res, 5000));
        
        const reportRes = await getImportReport(importId);
        
        console.log("Report status:", reportRes.data.status);
        if (reportRes.data.status === "completed_with_errors" || reportRes.data.status === "complete" || reportRes.data.status === "completed" || reportRes.data.status === "failed") {
          isCompleted = true;
          setReport(reportRes.data);
          setStep("result");
        }
      }
    } catch (error) {
      toast.error(t("failedProcessFile"));
      reset();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      handleUpload(droppedFile);
    }
  };

  // Inside your EmployeeImportDialog handle download:
  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const blob = await downloadImportTemplate();
      
      // Safety check: if the server returned an error as JSON despite our header
      if (blob.type === "application/json") {
        const text = await blob.text();
        const error = JSON.parse(text);
        throw new Error(error.message || t("templateNotFound"));
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "Employee_Import_Template.xlsx";
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success(t("templateDownloaded"));
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || t("failedDownloadTemplate"));
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePageChange = async (page: number) => {
    if (!report?.import_id) return;
    try {
      const pageRes = await getImportReport(report.import_id, page);
      setReport(pageRes.data);
    } catch (error) {
      toast.error(t("failedLoadPage"));
    }
  };

  const reset = () => {
    setStep("upload");
    setFile(null);
    setReport(null);
  };

  React.useEffect(() => {
    if (!open) {
      setTimeout(reset, 300); // Reset after animation
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("sm:max-w-xl transition-all duration-300 bg-white", step === "result" && "sm:max-w-[95vw]")}>
        <DialogHeader>
          <DialogTitle>{t("importEmployee")}</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {step === "upload" ? (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className={cn(
                "border-2 border-dashed border-grayscale-20 rounded-lg p-12 flex flex-col items-center justify-center gap-4 transition-colors",
                !isProcessing && "hover:border-primary cursor-pointer"
              )}
              onClick={() => !isProcessing && fileInputRef.current?.click()}
            >
              {isProcessing ? (
                <div className="flex flex-col items-center gap-2 text-center">
                  <Loader2 className="h-10 w-10 text-primary animate-spin" />
                  <p className="text-grayscale-90 font-medium">{t("processingFile")}</p>
                  <p className="text-grayscale-70 text-sm">{t("importProcessingWait")}</p>
                </div>
              ) : (
                <>
                  <div className="p-4 bg-grayscale-10 rounded-full">
                    <Paperclip className="h-8 w-8 text-grayscale-90" />
                  </div>
                  <div className="text-center">
                    <p className="text-grayscale-90">
                      {t("importDropFile")}
                    </p>
                    <p className="text-grayscale-90">
                      {t("importOr")}{" "}
                      <span className="text-primary font-semibold">{t("importClickBrowse")}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2 w-full justify-center">
                    <div className="h-[1px] bg-grayscale-20 flex-1 max-w-[40px]" />
                    <span className="text-grayscale-70 text-xs">{t("importOr")}</span>
                    <div className="h-[1px] bg-grayscale-20 flex-1 max-w-[40px]" />
                  </div>
                  <Button
                    variant="outline"
                    className="gap-2 border-primary text-primary hover:bg-blue-50 font-semibold"
                    onClick={async (e) => {
                      e.stopPropagation();
                      handleDownload();
                    }}
                    disabled={isDownloading}
                  >
                    {isDownloading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    {isDownloading ? t("downloading") : t("downloadExcelTemplate")}
                  </Button>
                </>
              )}
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".csv, .xlsx, .xls"
                onChange={handleFileChange}
                disabled={isProcessing}
              />
            </div>
          ) : report ? (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row gap-4 justify-around p-4 bg-grayscale-10 rounded-lg border border-grayscale-20">
                <div className="flex flex-col items-center">
                  <span className="text-grayscale-90 text-sm font-medium">{t("totalRows")}</span>
                  <span className="text-2xl font-bold">{report.total_rows}</span>
                </div>
                <div className="w-[1px] bg-grayscale-20 hidden md:block" />
                <div className="flex flex-col items-center">
                  <span className="flex items-center gap-1 text-success text-sm font-medium">
                    <CheckCircle2 className="h-4 w-4" /> {tCommon("success")}
                  </span>
                  <span className="text-2xl font-bold text-success">{report.success_rows}</span>
                </div>
                <div className="w-[1px] bg-grayscale-20 hidden md:block" />
                <div className="flex flex-col items-center">
                  <span className="flex items-center gap-1 text-error text-sm font-medium">
                    <AlertCircle className="h-4 w-4" /> {tCommon("failed")}
                  </span>
                  <span className="text-2xl font-bold text-error">{report.failed_rows}</span>
                </div>
              </div>

              {report.records && report.records.data && report.records.data.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-grayscale-90">{t("importDetails")}</h3>
                  <div className="border border-grayscale-20 rounded-md overflow-x-auto">
                   <ImportPreviewTable paginatedRecords={report.records} onPageChange={handlePageChange} />
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>

        <DialogFooter>
          {step === "result" ? (
             <Button
               onClick={() => {
                 onOpenChange(false);
                 reset();
               }}
               className="text-white hover:bg-primary font-semibold"
             >
               {tCommon("close")}
             </Button>
          ) : (
            <Button
              variant="outline"
              onClick={() => {
                if (!isProcessing) onOpenChange(false);
              }}
              className="border-primary text-primary hover:bg-blue-50"
              disabled={isProcessing}
            >
              {tCommon("cancel")}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
