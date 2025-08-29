import { phoneNumberSchema } from "@/lib/helpers";
import z from "zod";

export const employeeManagementFormScheme = z.object({
  photo_profile: z.string().optional(),
  name: z.string().min(1, "required"),
  email: z.string().email("Invalid email").min(1, "required"),
  // role_id: z.number().int().min(1, "required"),
  role_id: z.string().min(1, "required"),
  countryCode: z.string().min(1, "required"),
  phone_number: phoneNumberSchema,
  gender: z.string(),
  place_of_birth: z.string().min(1, "required"),
  date_of_birth: z.date(),
  marital_status: z.string(),
  // marital_status: z.enum(["single", "married", "divorced", "widowed", "separated"]),
  // blood_type: z.enum(["A", "B", "AB", "O"]).nullable(),
  blood_type: z.string().min(1, "required"),
  height: z.number().min(1, "required"),
  weight: z.number().min(1, "required"),
  id_number: z.string().min(16, "ID Number must be 16 digits."),
  npwp: z.string().min(1, "required"),
  bpjs: z.string(),
  citizen_id_address: z.string().min(1, "required"),
  residential_address: z.string().min(1, "required"),
  hobby: z.string().min(1, "required"),
  achievement: z
    .string()
    .min(1, "required")
    .max(255, "The achievement field must not be greater than 255 characters."),
  personal_description: z.string().min(1, "required"),

  social_media_accounts: z
    .array(
      z.object({
        type: z.string(),
        url: z.string(),
      }),
    )
    .optional(),

  job_position_id: z.string().min(1, "required"),
  department_id: z.string().min(1, "required"),
  job_level_id: z.string().min(1, "required"),

  direct_reports: z
    .array(
      z.object({
        direct_report_id: z.array(z.number().int()),
        relationship_type: z.enum(["primary", "secondary"]),
      }),
    )
    .optional(),

  // team_members: z.array(
  //   z.object({
  //     team_id: z.number().int().min(1, "required"),
  //   }),
  // ),
  team_members: z.string(),

  start_date: z.date(),
  end_date: z.date().optional(),

  // // status: z.enum(["0", "1"]), // active/inactive flag
  status: z.string(),
  base_salary: z.number(),
  salary_nett: z.number().min(1, "required"),

  allowances: z.array(
    z.object({
      allowance_type_id: z.string().min(1, "required"),
      allowance_value: z.number().min(1, "required"),
    }),
  ),

  bank_id: z.string().min(1, "required"),
  account_number: z.string().min(1, "required"),
  account_name: z.string().min(1, "required"),

  attachments: z.array(
    z.object({
      type: z.string().min(1, "required"),
      path: z.string().min(1, "required"),
    }),
  ),
  families: z.array(z.object({ id: z.number() })).optional(),
  educations: z.array(z.object({ id: z.number() })).optional(),
  work_experiences: z.array(z.object({ id: z.number() })).optional(),
  contact_refferences: z.array(z.object({ id: z.number() })).optional(),
});

export const employeeManagementFormDefaultValues = {
  photo_profile: "",
  name: "",
  email: "",
  role_id: "",
  countryCode: "+62",
  phone_number: "",
  gender: "male",
  place_of_birth: "",
  date_of_birth: new Date(),
  start_date: new Date(),
  marital_status: "single",
  blood_type: "",
  height: 0,
  weight: 0,
  id_number: "",
  npwp: "",
  bpjs: "",
  citizen_id_address: "",
  residential_address: "",
  hobby: "",
  achievement: "",
  personal_description: "",
  allowances: [
    {
      allowance_type_id: "",
      allowance_value: 0,
    },
  ],
  social_media_accounts: [
    {
      type: "",
      url: "",
    },
  ],
  job_position_id: "",
  department_id: "",
  job_level_id: "",
  status: "",
  team_members: "",
  direct_reports: [],
  base_salary: 0,
  salary_nett: 0,
  bank_id: "",
  account_name: "",
  account_number: "",
  attachments: [
    { type: "cv", path: "" },
    { type: "graduation_certificate", path: "" },
    { type: "personal_id", path: "" },
    { type: "health_insurance_card", path: "" },
    { type: "bank_account_book", path: "" },
    { type: "other", path: "" },
  ],
};
