import z from "zod";

export const jobLevelFormScheme = z.object({
  name: z.string().min(1, "required"),
});
export type IJobLevelForm = z.infer<typeof jobLevelFormScheme>;
export interface JobLevel {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}
