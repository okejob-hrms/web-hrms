import z from "zod";

export const formalEducationFormScheme = z.object({
  category: z.string().min(1, "required"),
  institution: z.string().min(1, "required"),
  major: z.string().min(1, "required"),
  location: z.string().min(1, "required"),
  start_date: z.date().min(1, "required"),
  graduation_date: z.date().min(1, "required"),
  gpa: z.number().min(1, "required").max(4.0, "The GPA must not exceed 4.00"),
  max_gpa: z
    .number()
    .min(1, "required")
    .max(4.0, "The GPA must not exceed 4.00"),
});
export const nonFormalEducationFormScheme = z.object({
  category: z.string().min(1, "required"),
  institution: z.string().min(1, "required"),
  location: z.string().min(1, "required"),
  start_date: z.date().min(1, "required"),
  graduation_date: z.date().min(1, "required"),
  notes: z.string().min(1, "required"),
});
export type IFormalEducationForm = z.infer<typeof formalEducationFormScheme>;
export type INonFormalEducationForm = z.infer<
  typeof nonFormalEducationFormScheme
>;

export interface IEducationResponse {
  category: string;
  institution: string;
  major: string;
  location: string;
  start_date: string;
  graduation_date: string;
  gpa: string;
  notes: string;
  employee_profile_id: string;
  updated_at: string;
  created_at: string;
  id: number;
}
