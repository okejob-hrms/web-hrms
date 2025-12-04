import { apiRecognition } from "@/lib/api";

import { FaceRequest, FaceResponse } from "./types";

export const getFace = async (id:number): Promise<FaceResponse> => {
  const response = await apiRecognition.get<FaceResponse>(
    `faces/profile/${id}`
  );

  return response.json();
};

export const postFace = async (
  payload: FaceRequest,
): Promise<FaceResponse> => {

  const form = new FormData();
  if (payload.file) {
    form.append("file", payload.file, payload.file.name);
  }
  form.append("user_id", String(payload.user_id));

  return apiRecognition
    .post("faces", {
      body: form,
    })
    .json<FaceResponse>();
};


export const removeFace = async (
  id: number,
): Promise<FaceResponse> => {
  return apiRecognition
    .delete(`user/faces/${id}`, {
      json: {},
    })
    .json<FaceResponse>();
};