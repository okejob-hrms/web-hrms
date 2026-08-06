import type { useTranslations } from "next-intl";
import { createPhoneSchemas } from "@/lib/validation/schemas";
import z from "zod";

type TranslationFn = ReturnType<typeof useTranslations>;

/** Employment status: Active=1, Inactive=2. Legacy inactive `0` maps to `2`. */
export function toEmploymentStatusValue(
  status: string | number | null | undefined,
): "1" | "2" | "" {
  if (status === null || status === undefined || status === "") {
    return "";
  }
  const normalized = String(status);
  if (normalized === "1") return "1";
  if (normalized === "2" || normalized === "0") return "2";
  return "";
}

const attachmentLabelKeys: Record<string, string> = {
  cv: "attachmentCv",
  graduation_certificate: "attachmentGraduationCertificate",
  personal_id: "attachmentPersonalId",
  family_card: "attachmentFamilyCard",
  npwp: "attachmentNpwp",
  health_insurance_card: "attachmentHealthInsurance",
  bank_account_book: "attachmentBankBook",
  driver_license: "attachmentDriverLicense",
  other: "attachmentOthers",
};

/**
 * Builds the employee form schema with localized validation messages.
 *
 * @param t validation-namespace translations (`useTranslations("validation")`)
 * @param tEmployee employee-namespace translations for attachment labels
 */
export function createEmployeeManagementFormScheme(
  t: TranslationFn,
  tEmployee: TranslationFn,
) {
  const { phoneNumberSchema } = createPhoneSchemas(t);

  return z.object({
    photo_profile: z.string().optional().nullable(),
    name: z.string().min(1, t("employeeNameRequired")),
    email: z
      .string()
      .min(1, t("employeeEmailRequired"))
      .email(t("invalidEmail")),
    role_id: z.string().min(1, t("userRoleRequired")),
    countryCode: z.string().optional(),
    country_code: z.string().optional(),
    phone_number: phoneNumberSchema,
    gender: z.string(),
    place_of_birth: z.string().min(1, t("placeOfBirthRequired")),
    date_of_birth: z.date({ message: t("dateOfBirthRequired") }),
    marital_status: z
      .string()
      .min(1, t("maritalStatusRequired"))
      .refine((value) => ["1", "2", "3", "4"].includes(value), {
        message: t("maritalStatusInvalid"),
      }),
    blood_type: z.string().min(1, t("bloodTypeRequired")),
    height: z
      .number({ message: t("heightRequired") })
      .min(1, t("heightMin"))
      .max(999.99, t("heightMax")),
    weight: z
      .number({ message: t("weightRequired") })
      .min(1, t("weightMin"))
      .max(999.99, t("weightMax")),
    id_number: z
      .string()
      .min(1, t("idNumberRequired"))
      .length(16, t("idNumberLength")),
    npwp: z.string().optional().nullable(),
    bpjs: z.string().optional().nullable(),
    citizen_id_address: z.string().min(1, t("citizenIdAddressRequired")),
    residential_address: z.string().min(1, t("residentialAddressRequired")),
    hobby: z.string().optional().nullable(),
    achievement: z
      .string()
      .max(255, t("achievementMax"))
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
    job_position_id: z.string().min(1, t("positionRequired")),
    department_id: z.string().min(1, t("departmentRequired")),
    job_level_id: z.string().min(1, t("jobLevelRequired")),
    primary_direct_report_id: z.number().optional().nullable(),
    additional_direct_report_id: z.number().optional().nullable(),
    team_member: z.string().min(1, t("teamRequired")),
    start_date: z
      .union([z.date(), z.string().min(1, t("startDateRequired"))])
      .refine(
        (value) =>
          value instanceof Date ||
          (typeof value === "string" && value.trim() !== ""),
        { message: t("startDateRequired") },
      ),
    end_date: z.date().or(z.string()).optional().nullable(),
    status: z
      .string()
      .min(1, t("employmentStatusRequired"))
      .refine((value) => ["1", "2"].includes(value), {
        message: t("employmentStatusInvalid"),
      }),
    base_salary: z
      .number({ message: t("baseSalaryRequired") })
      .min(0, t("baseSalaryRequired")),
    salary_nett: z
      .number({ message: t("salaryNettRequired") })
      .min(1, t("salaryNettMin")),
    allowances: z.array(
      z
        .object({
          allowance_type_id: z.string().optional().nullable(),
          allowance_value: z.number().optional().nullable(),
        })
        .optional()
        .nullable(),
    ),

    bank_id: z.string().min(1, t("bankRequired")),
    account_number: z.string().min(1, t("accountNumberRequired")),
    account_name: z.string().min(1, t("accountNameRequired")),

    attachments: z
      .array(
        z.object({
          type: z.string().min(1, t("fieldRequired")),
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
            const labelKey = attachmentLabelKeys[att.type];
            const label = labelKey ? tEmployee(labelKey) : att.type;
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: t("attachmentRequired", { document: label }),
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
    branch_id: z.string().min(1, t("companyRequired")),
  });
}

export type EmployeeManagementFormValues = z.infer<
  ReturnType<typeof createEmployeeManagementFormScheme>
>;

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
  marital_status: "",
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
  base_salary: 0,
  salary_nett: 0,
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
