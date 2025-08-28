import { useState } from "react";
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
  const { setValue, getValues } = useFormContext();
  const [preview, setPreview] = useState<PreviewDoc | null>(null);

  const { mutate: uploadDocument, isPending } = useMutation({
    mutationFn: uploadAttachment,
    onSuccess: (res) => {
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

      setValue("attachments", newAttachments);
      setPreview({
        name: res.data.filename,
        size: res.data.size,
        url: res.data.url,
        type: res.data.mime_type,
      });
    },
    onError: (error) => {
      toast.error(`Failed to upload ${name}: ${error.message}`);
    },
  });

  const handleFileUpload = (file: File) => {
    if (file.size > maxSize) {
      toast.error(
        `File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB`,
      );
      return;
    }

    uploadDocument(file);
  };

  const handleRemove = () => {
    const currentAttachments = getValues("attachments") || [];
    const filteredAttachments = currentAttachments.filter(
      (attachment: { type: string; path: string }) => attachment.type !== name,
    );
    setValue("attachments", filteredAttachments);
    setPreview(null);
  };

  return {
    preview,
    handleFileUpload,
    handleRemove,
    isUploading: isPending,
    setPreview,
  };
};
