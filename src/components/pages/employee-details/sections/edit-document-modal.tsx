"use client";

import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SelectForm } from "@/components/ui/select-form";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { uploadAttachment } from "@/services/attachments";
import { updateEmployeeDocument } from "@/services/document";
import { IDocument } from "@/lib/types";

const DOCUMENT_TYPES = [
  "cv",
  "personal_id",
  "bank_account_book",
  "graduation_certificate",
  "health_insurance_card",
  "npwp",
  "family_card",
  "driver_license",
  "other",
] as const;

const schema = z.object({
  type: z.string().min(1),
  file: z.any().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  file: IDocument;
  userId: number;
}

export default function EditDocumentModal({
  isOpen,
  onClose,
  file,
  userId,
}: Props) {
  const t = useTranslations("employee");
  const tCommon = useTranslations("common");
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: file.type || "other",
    },
  });

  React.useEffect(() => {
    if (isOpen) {
      form.reset({ type: file.type || "other" });
      setSelectedFile(null);
    }
  }, [isOpen, file.type, form]);

  const typeOptions = DOCUMENT_TYPES.map((value) => ({
    label: value.replace(/_/g, " "),
    value,
  }));

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      if (!selectedFile) {
        throw new Error(t("editDocumentFileRequired"));
      }
      setIsUploading(true);
      const uploaded = await uploadAttachment(selectedFile);
      const path = uploaded?.data?.path;
      if (!path) {
        throw new Error(t("editDocumentUploadFailed"));
      }
      return updateEmployeeDocument(userId, file.id, {
        type: values.type,
        path,
      });
    },
    onSuccess: () => {
      toast.success(t("documentUpdatedSuccess"));
      queryClient.invalidateQueries({ queryKey: ["document-employee"] });
      queryClient.invalidateQueries({
        queryKey: ["document-versions", userId, file.id],
      });
      onClose();
    },
    onError: (error: Error) => {
      toast.error(t("documentUpdateFailed", { message: error.message }));
    },
    onSettled: () => setIsUploading(false),
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-white max-w-md">
        <DialogHeader>
          <DialogTitle>{t("editDocument")}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
            className="space-y-4"
          >
            <SelectForm
              name="type"
              label={t("documentTypeLabel")}
              options={typeOptions}
              required
            />
            <div className="space-y-1">
              <label className="text-sm font-normal">
                {t("replaceFile")}
              </label>
              <input
                type="file"
                className="block w-full text-sm"
                onChange={(e) =>
                  setSelectedFile(e.target.files?.[0] ?? null)
                }
              />
              <p className="text-xs text-text-disabled">
                {t("editDocumentVersionHint")}
              </p>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={mutation.isPending || isUploading}
              >
                {tCommon("cancel")}
              </Button>
              <Button
                type="submit"
                disabled={mutation.isPending || isUploading || !selectedFile}
              >
                {mutation.isPending || isUploading
                  ? tCommon("saving")
                  : tCommon("save")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
