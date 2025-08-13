import z from "zod";

export type DepartmentFormValues = z.infer<
  typeof departmentManagementFormScheme
>;

export const departmentManagementFormScheme = z.object({
  departmentName: z.string().min(1, "Department name is required"),
  description: z.string(),
});
