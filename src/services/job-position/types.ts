import z from "zod";

export const positionFormScheme = z.object({
  name: z.string().min(1, "required"),
});
export type IPositionForm = z.infer<typeof positionFormScheme>;

export interface JobPositionResponse {
  id: number;
  name: string;
  description?: string;
  status: string; // "1" or "2" as string
  created_at: string;
  updated_at: string;
}
