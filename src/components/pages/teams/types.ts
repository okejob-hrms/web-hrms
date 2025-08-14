import z from "zod";

export type TeamsFormValues = z.infer<typeof teamsFormScheme>;

export const teamsFormScheme = z.object({
  name: z.string().min(1, "Team name is required"),
  description: z.string(),
});
