import z from "zod";

export const departmentFormScheme = z.object({
  name: z.string().min(1, "required"),
  description: z.string().optional(),
});

export type IDepartmentForm = z.infer<typeof departmentFormScheme>;
