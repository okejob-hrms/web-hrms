import z from "zod";

export const employeeManagementFormScheme = z.object({
  photo_profile: z.string().min(1, "required"),
  name: z.string().min(1, "required"),
  email: z.string().email("Invalid email").min(1, "required"),
  // role_id: z.number().int().min(1, "required"),
  role_id: z.string().min(1, "required"),
  countryCode: z.string().min(1, "required"),
  phone_number: z.string().min(1, "required").max(13),
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

  social_media_accounts: z.array(
    z.object({
      type: z.string().min(1, "required"),
      url: z.string(),
    }),
  ),

  job_position_id: z.string().min(1, "required"),
  department_id: z.string().min(1, "required"),
  job_level_id: z.string().min(1, "required"),

  direct_reports: z.array(
    z.object({
      direct_report_id: z.array(z.number().int().min(1, "required")),
      relationship_type: z.enum(["primary", "secondary"]),
    }),
  ),

  // team_members: z.array(
  //   z.object({
  //     team_id: z.number().int().min(1, "required"),
  //   }),
  // ),
  team_members: z.string(),

  start_date: z.date(),
  end_date: z.date().nullable(),

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

  bank_name: z.string().min(1, "required"),
  account_number: z.string().min(1, "required"),
  account_name: z.string().min(1, "required"),

  attachments: z.array(
    z.object({
      type: z.string().min(1, "required"),
      path: z.string().min(1, "required"),
    }),
  ),

  // families: z.array(
  //   z.object({
  //     name: z.string().min(1, "required"),
  //     relationship: z.string().min(1, "required"),
  //     placeOfBirth: z.string().min(1, "required"),
  //     bornDate: z.date(),
  //     education: z.string().min(1, "required"),
  //     email: z.string().email().optional(),
  //     phoneNumber: z.string().optional(),
  //     occupation: z.string().optional(),
  //     company: z.string().optional(),
  //   })
  // ),

  // formalEducations: z.array(
  //   z.object({
  //     school: z.string().min(1, "required"),
  //     city: z.string().min(1, "required"),
  //     major: z.string().min(1, "required"),
  //     startDate: z.date(),
  //     graduateDate: z.date(),
  //     gpa: z.number().min(1, "required"),
  //   })
  // ),

  // nonFormalEducations: z.array(
  //   z.object({
  //     institution: z.string().min(1, "required"),
  //     location: z.string().min(1, "required"),
  //     notes: z.string().min(1, "required"),
  //     startDate: z.date(),
  //     graduateDate: z.date(),
  //   })
  // ),

  // experiences: z.array(
  //   z.object({
  //     company: z.string().min(1, "required"),
  //     initialPosition: z.string().min(1, "required"),
  //     finalPosition: z.string().min(1, "required"),
  //     supervision: z.string().min(1, "required"),
  //     supervisorContact: z.string().min(1, "required"),
  //     companyAddress: z.string().min(1, "required"),
  //     joinDate: z.date(),
  //     resignDate: z.date(),
  //     lastSalary: z.number().min(1, "required"),
  //     reasonOfResign: z.string().min(1, "required"),
  //   })
  // ),

  // contactOfReference: z.object({
  //   name: z.string().min(1, "required"),
  //   relationship: z.string().min(1, "required"),
  //   email: z.string().email().optional(),
  //   phoneNumber: z.string().optional(),
  //   occupation: z.string().optional(),
  //   company: z.string().optional(),
  // }),
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

  social_media_accounts: [
    {
      type: "",
      url: "",
    },
  ],

  // job_position_id: 0,
  // department_id: 0,
  // job_level_id: 0,

  direct_reports: [],

  // team_members: [
  //   {
  //     team_id: 0,
  //   },
  // ],

  // start_date: new Date(),
  end_date: null,

  // status: "1",
  base_salary: 0,
  salary_nett: 0,

  // allowances: [
  //   {
  //     allowance_type_id: 0,
  //     allowance_value: 0,
  //   },
  // ],

  // bank_name: "",
  // account_number: "",
  // account_name: "",

  // attachments: [
  //   {
  //     type: "",
  //     path: "",
  //   },
  // ],

  // families: [
  //   {
  //     name: "",
  //     relationship: "",
  //     placeOfBirth: "",
  //     bornDate: new Date(),
  //     education: "",
  //     email: "",
  //     phoneNumber: "",
  //     occupation: "",
  //     company: "",
  //   },
  // ],

  // formalEducations: [
  //   {
  //     school: "",
  //     city: "",
  //     major: "",
  //     startDate: new Date(),
  //     graduateDate: new Date(),
  //     gpa: 0,
  //   },
  // ],

  // nonFormalEducations: [
  //   {
  //     institution: "",
  //     location: "",
  //     notes: "",
  //     startDate: new Date(),
  //     graduateDate: new Date(),
  //   },
  // ],

  // experiences: [
  //   {
  //     company: "",
  //     initialPosition: "",
  //     finalPosition: "",
  //     supervision: "",
  //     supervisorContact: "",
  //     companyAddress: "",
  //     joinDate: new Date(),
  //     resignDate: new Date(),
  //     lastSalary: 0,
  //     reasonOfResign: "",
  //   },
  // ],

  // contactOfReference: {
  //   name: "",
  //   relationship: "",
  //   email: "",
  //   phoneNumber: "",
  //   occupation: "",
  //   company: "",
  // },
};
