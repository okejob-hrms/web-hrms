import { useState, useCallback } from "react";
import { useFormContext } from "react-hook-form";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { uploadAttachment } from "@/services/attachments";
import { getPublicFileUrl } from "@/lib/helpers";
import { ApiErrorResponse } from "@/lib/types";

export interface PreviewDoc {
  name: string;
  size: number;
  url: string;
  type: string;
}

export interface UseFileUploadProps {
  name: string;
  maxSize?: number;
}

export const useFileUpload = ({
  name,
  maxSize = 5 * 1024 * 1024,
}: UseFileUploadProps) => {
  const t = useTranslations("employee");
  const { setValue, getValues, trigger } = useFormContext();
  const [preview, setPreview] = useState<PreviewDoc | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  const { mutate: uploadDocument, isPending } = useMutation({
    mutationFn: uploadAttachment,
    onSuccess: (res) => {
      try {
        const currentAttachments = getValues("attachments") || [];
        const filteredAttachments = currentAttachments.filter(
          (attachment: { type: string; path: string }) =>
            attachment.type !== name,
        );
        const newAttachments = [
          ...filteredAttachments,
          {
            type: name,
            path: res.data.path,
          },
        ];

        setValue("attachments", newAttachments, {
          shouldValidate: true,
          shouldDirty: true,
        });

        setPreview({
          name: res.data.filename,
          size: res.data.size,
          url: getPublicFileUrl(res.data.path),
          type: res.data.mime_type,
        });

        trigger("attachments");
      } catch (error) {
        console.error("Error updating attachments:", error);
        toast.error(t("attachmentUpdateFailed"));
      }
    },
    onError: async (error: Error & { response?: Response }) => {
      let message = t("attachmentUploadFailed");
      if (error?.response) {
        try {
          const errorData: ApiErrorResponse = await error.response.json();
          message = errorData.message || message;
        } catch {
          message = error.message || message;
        }
      } else if (error.message) {
        message = error.message;
      }
      toast.error(message);
      setPreview(null);
    },
  });

  const handleFileUpload = useCallback(
    (file: File) => {
      if (file.size > maxSize) {
        toast.error(
          t("fileSizeMaxMb", { size: Math.round(maxSize / (1024 * 1024)) }),
        );
        return;
      }

      uploadDocument(file);
    },
    [maxSize, uploadDocument, t],
  );

  const handleRemove = useCallback(() => {
    setIsRemoving(true);

    try {
      const currentAttachments = getValues("attachments") || [];
      const filteredAttachments = currentAttachments.filter(
        (attachment: { type: string; path: string }) =>
          attachment.type !== name,
      );
      setValue("attachments", filteredAttachments, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });
      setPreview(null);
      trigger("attachments");
      setTimeout(() => {
        setIsRemoving(false);
      }, 100);
    } catch (error) {
      console.error("Error removing attachment:", error);
      toast.error(t("attachmentRemoveFailed"));
      setIsRemoving(false);
    }
  }, [getValues, setValue, trigger, name, t]);

  const setPreviewSafe = useCallback((newPreview: PreviewDoc | null) => {
    try {
      setPreview(newPreview);
    } catch (error) {
      console.error("Error setting preview:", error);
    }
  }, []);

  return {
    preview,
    handleFileUpload,
    handleRemove,
    isUploading: isPending,
    isRemoving,
    setPreview: setPreviewSafe,
  };
};
