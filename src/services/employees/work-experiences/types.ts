import { phoneNumberSchema } from "@/lib/helpers";
import z from "zod";

export interface IResponseWorkExperience {
  id: number;
  employee_profile_id: number;
  company: string;
  initial_position: string;
  final_position: string;
  supervisor: string;
  supervisor_contact: string;
  company_address: string;
  start_date: string;
  end_date: string;
  last_salary: string;
  reason_for_resign: string;
  created_at: string;
  updated_at: string;
}

export const WorkExperienceFormSchema = z.object({
  company: z.string().min(1, "Company is required"),
  initial_position: z.string().min(1, "Initial position is required"),
  final_position: z.string().min(1, "Final position is required"),
  supervisor: z.string().min(1, "Supervisor is required"),
  supervisor_contact: phoneNumberSchema,
  company_address: z.string().min(1, "Company address is required"),
  start_date: z.date().min(1, "Date of joining is required"),
  end_date: z.date().min(1, "Date of resignation is required"),
  last_salary: z
    .number({
      error: "Last salary must be a number",
    })
    .nonnegative("Last salary must be 0 or greater"),
  reason_for_resign: z.string().min(1, "Reason for resign is required"),
});

export type IWorkExperienceForm = z.infer<typeof WorkExperienceFormSchema>;
