import { phoneNumberSchema } from "@/lib/helpers";
import z from "zod";

export interface IContactReferenceResponse {
  id: number;
  employee_profile_id: number;
  name: string;
  relationship: string;
  email: string;
  phone: string;
  occupation: string;
  company: string;
  created_at: string;
  updated_at: string;
}

export const ContactReferenceFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  relationship: z.string().min(1, "Relationship is required"),
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  phone: phoneNumberSchema,
  occupation: z.string().min(1, "Occupation is required"),
  company: z.string().min(1, "Company is required"),
});

export type IContactReferenceForm = z.infer<typeof ContactReferenceFormSchema>;
