import { z } from "zod";

export const businessTripFormSchema = z
  .object({
    start_date: z.string().min(1, "Start date is required"),
    end_date: z.string().min(1, "End date is required"),
    destination: z
      .string()
      .min(1, "Destination is required")
      .max(255, "Destination too long"),
    reason: z
      .string()
      .min(1, "Reason is required")
      .max(2000, "Reason too long"),
  })
  .refine(
    (data) => {
      if (!data.start_date || !data.end_date) return true;
      return new Date(data.end_date) >= new Date(data.start_date);
    },
    {
      message: "End date must be on or after start date",
      path: ["end_date"],
    },
  );

export type BusinessTripFormValues = z.infer<typeof businessTripFormSchema>;
