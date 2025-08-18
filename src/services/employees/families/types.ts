import { Dayjs } from "dayjs";
import z from "zod";

export const familyFormScheme = z.object({
  name: z.string().min(1, "required"),
  relationship: z.string().min(1, "required"),
  date_of_birth: z.string().min(1, "required"),
  place_of_birth: z.string().min(1, "required"),
  email: z.string().min(1, "required"),
  phone: z.string().min(1, "required"),
  occupation: z.string().min(1, "required"),
  company: z.string().min(1, "required"),
  highest_education: z.number().min(1, "required"),
});
export type IFamilyForm = z.infer<typeof familyFormScheme>;

export interface IFamilyResponse {
  employee_profile_id: number;
  name: string;
  relationship: string;
  date_of_birth: Dayjs;
  place_of_birth: string;
  email: string;
  phone: number;
  occupation: string;
  company: string;
  highest_education: number;
  updated_at: string;
  created_at: string;
  id: number;
}
