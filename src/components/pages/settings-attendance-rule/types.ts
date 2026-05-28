import { z } from 'zod';

export const CONDITION_TYPE_OPTIONS = [
  { value: 'per_occurrence', label: 'Per Kejadian' },
  { value: 'monthly_aggregate', label: 'Akumulasi Bulanan' },
] as const;

export const TRIGGER_TYPE_OPTIONS = [
  { value: 'late', label: 'Keterlambatan' },
  { value: 'early_leave', label: 'Pulang Cepat' },
  { value: 'both', label: 'Keduanya' },
] as const;

export const IMPACT_TYPE_OPTIONS = [
  { value: 'base_salary', label: 'Gaji Pokok' },
  { value: 'allowance', label: 'Tunjangan' },
] as const;

export const VALUE_TYPE_OPTIONS = [
  { value: 'fixed', label: 'Nominal (Rp)' },
  { value: 'percentage', label: 'Persentase (%)' },
] as const;

export const attendanceRuleFormSchema = z
  .object({
    name: z.string().min(1, 'Nama aturan wajib diisi').max(255),
    shift_id: z.array(z.string()).min(1, 'Pilih minimal 1 shift'),
    condition_type: z.enum(['per_occurrence', 'monthly_aggregate']),
    trigger_type: z.enum(['late', 'early_leave', 'both']),
    min_threshold: z
      .union([z.number().int().min(0), z.nan()])
      .optional()
      .transform((v) => (typeof v === 'number' && !Number.isNaN(v) ? v : undefined)),
    max_threshold: z
      .union([z.number().int().min(0), z.nan()])
      .optional()
      .transform((v) => (typeof v === 'number' && !Number.isNaN(v) ? v : undefined)),
    monthly_free_count: z
      .union([z.number().int().min(0), z.nan()])
      .optional()
      .transform((v) => (typeof v === 'number' && !Number.isNaN(v) ? v : undefined)),
    impact_type: z.enum(['base_salary', 'allowance']),
    target_allowance_type_id: z.string().optional().nullable(),
    value_type: z.enum(['fixed', 'percentage']),
    amount: z.number().min(0, 'Nilai harus ≥ 0'),
    priority: z
      .union([z.number().int().min(1), z.nan()])
      .optional()
      .transform((v) => (typeof v === 'number' && !Number.isNaN(v) ? v : undefined)),
    is_active: z.boolean(),
    starts_on: z.string().optional().nullable(),
    ends_on: z.string().optional().nullable(),
    note: z.string().max(500, 'Maksimal 500 karakter').optional().nullable(),
  })
  .refine(
    (data) =>
      data.condition_type !== 'per_occurrence' ||
      (data.monthly_free_count !== undefined && data.monthly_free_count !== null),
    {
      message: 'Jumlah dispensasi wajib diisi untuk tipe Per Kejadian',
      path: ['monthly_free_count'],
    },
  )
  .refine(
    (data) =>
      data.condition_type !== 'monthly_aggregate' ||
      (data.min_threshold !== undefined && data.min_threshold !== null),
    {
      message: 'Minimum threshold wajib diisi untuk tipe Akumulasi Bulanan',
      path: ['min_threshold'],
    },
  )
  .refine(
    (data) =>
      data.condition_type !== 'monthly_aggregate' ||
      (data.max_threshold !== undefined && data.max_threshold !== null),
    {
      message: 'Maximum threshold wajib diisi untuk tipe Akumulasi Bulanan',
      path: ['max_threshold'],
    },
  )
  .refine(
    (data) =>
      data.min_threshold === undefined ||
      data.max_threshold === undefined ||
      data.max_threshold >= data.min_threshold,
    {
      message: 'Maximum harus ≥ Minimum',
      path: ['max_threshold'],
    },
  )
  .refine(
    (data) =>
      data.impact_type !== 'allowance' ||
      (!!data.target_allowance_type_id && data.target_allowance_type_id !== ''),
    {
      message: 'Pilih tipe tunjangan target',
      path: ['target_allowance_type_id'],
    },
  )
  .refine(
    (data) => data.value_type !== 'percentage' || data.amount <= 100,
    {
      message: 'Persentase tidak boleh lebih dari 100',
      path: ['amount'],
    },
  )
  .refine(
    (data) =>
      !data.starts_on ||
      !data.ends_on ||
      new Date(data.ends_on) >= new Date(data.starts_on),
    {
      message: 'Tanggal berakhir harus ≥ tanggal mulai',
      path: ['ends_on'],
    },
  );

export type AttendanceRuleFormValues = z.input<typeof attendanceRuleFormSchema>;
export type AttendanceRuleFormOutput = z.output<typeof attendanceRuleFormSchema>;
