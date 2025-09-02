import { useState, useCallback } from "react";
import { useFormContext } from "react-hook-form";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { uploadAttachment } from "@/services/attachments";

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
          url: res.data.url,
          type: res.data.mime_type,
        });

        trigger("attachments");
      } catch (error) {
        console.error("Error updating attachments:", error);
        toast.error("Failed to update attachments");
      }
    },
    onError: (error) => {
      toast.error(`Failed to upload ${name}: ${error.message}`);
      setPreview(null);
    },
  });

  const handleFileUpload = useCallback(
    (file: File) => {
      if (file.size > maxSize) {
        toast.error(
          `File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB`,
        );
        return;
      }

      uploadDocument(file);
    },
    [maxSize, uploadDocument],
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
      toast.error("Failed to remove attachment");
      setIsRemoving(false);
    }
  }, [getValues, setValue, trigger, name]);

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
