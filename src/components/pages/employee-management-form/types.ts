import { phoneNumberSchema } from "@/lib/helpers";
import z from "zod";

export const employeeManagementFormScheme = z.object({
  photo_profile: z.string().optional().nullable(),
  name: z.string().min(1, "required"),
  email: z.string().email("Invalid email").min(1, "required"),
  // role_id: z.number().int().min(1, "required"),
  role_id: z.string().min(1, "required"),
  countryCode: z.string().optional(),
  country_code: z.string().optional(),
  phone_number: phoneNumberSchema,
  gender: z.string(),
  place_of_birth: z.string().min(1, "required"),
  date_of_birth: z.date(),
  marital_status: z.string(),
  blood_type: z.string().min(1, "required"),
  height: z.number().min(1, "required"),
  weight: z.number().min(1, "required"),
  id_number: z.string().min(16, "ID Number must be 16 digits."),
  npwp: z.string().optional().nullable(),
  bpjs: z.string().optional().nullable(),
  citizen_id_address: z.string().min(1, "required"),
  residential_address: z.string().min(1, "required"),
  hobby: z.string().optional().nullable(),
  achievement: z
    .string()
    .max(255, "The achievement field must not be greater than 255 characters.")
    .optional()
    .nullable(),
  personal_description: z.string().optional().nullable(),

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
  primary_direct_report_id: z.number().optional().nullable(),
  additional_direct_report_id: z.number().optional().nullable(),
  team_member: z.string().min(1, "required"),
  start_date: z.date().or(z.string()),
  end_date: z.date().or(z.string()).optional().nullable(),
  status: z.string(),
  base_salary: z.number().nullable(),
  salary_nett: z.number().min(1, "required"),
  allowances: z.array(
    z
      .object({
        allowance_type_id: z.string().optional().nullable(),
        allowance_value: z.number().optional().nullable(),
      })
      .optional()
      .nullable(),
  ),

  bank_id: z.string().min(1, "required"),
  account_number: z.string().min(1, "required"),
  account_name: z.string().min(1, "required"),

  attachments: z
    .array(
      z.object({
        type: z.string().min(1, "required"),
        path: z.string(),
      }),
    )
    .superRefine((attachments, ctx) => {
      const optionalTypes = [
        "other",
        "npwp",
        "health_insurance_card",
        "driver_license",
      ];
      attachments.forEach((att, index) => {
        if (!optionalTypes.includes(att.type) && att.path.trim() === "") {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "required",
            path: [index, "path"],
          });
        }
      });
    }),
  employee_documents: z
    .array(
      z.object({
        type: z.string(),
        path: z.string(),
      }),
    )
    .optional(),
  families: z
    .array(
      z.object({
        id: z.number(),
        employee_profile_id: z.number(),
        name: z.string(),
        relationship: z.string(),
        date_of_birth: z.string(),
        place_of_birth: z.string(),
        email: z.string(),
        phone: z.string(),
        occupation: z.string(),
        company: z.string(),
        highest_education: z.string().or(z.number()),
        created_at: z.string(),
        updated_at: z.string(),
      }),
    )
    .optional()
    .or(z.array(z.object({ id: z.number() })))
    .optional(),
  educations: z
    .array(
      z.object({
        id: z.number(),
        employee_profile_id: z.number(),
        category: z.string(),
        institution: z.string(),
        major: z.string(),
        location: z.string(),
        start_date: z.string(),
        graduation_date: z.string(),
        gpa: z.string(),
        notes: z.string(),
        created_at: z.string(),
        updated_at: z.string(),
      }),
    )
    .optional()
    .or(z.array(z.object({ id: z.number() })))
    .optional(),
  work_experiences: z
    .array(
      z.object({
        id: z.number(),
        employee_profile_id: z.number(),
        company: z.string(),
        initial_position: z.string(),
        final_position: z.string(),
        supervisor: z.string(),
        supervisor_contact: z.string(),
        company_address: z.string(),
        start_date: z.string(),
        end_date: z.string(),
        last_salary: z.string(),
        reason_for_resign: z.string(),
        created_at: z.string(),
        updated_at: z.string(),
      }),
    )
    .optional()
    .or(z.array(z.object({ id: z.number() })))
    .optional(),
  contact_refferences: z
    .array(
      z.object({
        id: z.number(),
        employee_profile_id: z.number(),
        name: z.string(),
        relationship: z.string(),
        email: z.string(),
        phone: z.string(),
        occupation: z.string(),
        company: z.string(),
        created_at: z.string(),
        updated_at: z.string(),
      }),
    )
    .optional()
    .or(z.array(z.object({ id: z.number() })))
    .optional(),
  branch_id: z.string().min(1, "required"),
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
  start_date: "",
  end_date: "",
  marital_status: "single",
  blood_type: "",
  height: 0,
  weight: 0,
  id_number: "",
  npwp: null,
  bpjs: null,
  citizen_id_address: "",
  residential_address: "",
  hobby: "",
  achievement: "",
  personal_description: "",
  social_media_accounts: [
    {
      type: "",
      url: "",
    },
  ],
  base_salary: null,
  status: "1",
  job_position_id: "",
  department_id: "",
  job_level_id: "",
  team_member: "",
  bank_id: "",
  account_name: "",
  account_number: "",
  branch_id: "",
  attachments: [
    { type: "cv", path: "" },
    { type: "graduation_certificate", path: "" },
    { type: "personal_id", path: "" },
    { type: "family_card", path: "" },
    { type: "npwp", path: "" },
    { type: "health_insurance_card", path: "" },
    { type: "bank_account_book", path: "" },
    { type: "driver_license", path: "" },
    { type: "other", path: "" },
  ],
};
