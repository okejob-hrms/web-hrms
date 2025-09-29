import { IEmployeeResponse } from "../../types";
import { z } from "zod";

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface IWorkAndHandoverResponse {
  id: number;
  offboarding_id: number;
  category: string;
  name: string;
  notes: string;
  status: number;
  expected_return_date: string | null;
  received_at: string | null;
  meta: {
    project_name: string;
    priority: string;
    deadline: string;
    client_count: number;
    active_projects: number;
    [key: string]: any;
  };
  created_at: string;
  updated_at: string;
  recipients: IEmployeeResponse[];
}

const recipientSchema = z.object({
  user_id: z.number(),
  status: z.number(),
});

const baseSchema = z.object({
  category: z.enum(["work", "document", "equipment", "facility"]),
  name: z.string(),
});

export const workOrDocumentSchema = baseSchema.extend({
  category: z.enum(["work", "document"]),
  recipients: z
    .array(recipientSchema)
    .min(1, "At least one recipient is required"),
});

export const equipmentOrFacilitySchema = baseSchema.extend({
  category: z.enum(["equipment", "facility"]),
  notes: z.string().min(1, "Notes are required"),
  status: z.number(),
});

export const validationSchema = z.union([
  workOrDocumentSchema,
  equipmentOrFacilitySchema,
]);

export type IWorkDocumentHandoverRequest = z.infer<typeof workOrDocumentSchema>;
export type IEquipmentFacilityHandoverRequest = z.infer<
  typeof equipmentOrFacilitySchema
>;
