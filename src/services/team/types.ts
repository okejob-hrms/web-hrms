import z from "zod";

export const teamFormScheme = z.object({
  name: z.string().min(1, "required"),
  description: z.string().optional(),
});

export type ITeamForm = z.infer<typeof teamFormScheme>;

export interface TeamResponse {
  id: number;
  name: string;
  description?: string | null;
  created_at: string;
  updated_at: string;
}
