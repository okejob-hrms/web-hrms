import { ApiResponse } from "@/lib/types";
import { Attachment } from "./type";
import { apiUpload } from "@/lib/api";

export const uploadAttachment = async (
  file: File,
): Promise<ApiResponse<Attachment>> => {
  const formData = new FormData();
  formData.append("file", file, file.name);

  const response = await apiUpload.post<ApiResponse<Attachment>>(
    `attachments`,
    {
      body: formData,
    },
  );
  return response.json();
};
