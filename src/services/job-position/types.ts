import z from "zod";

export const positionFormScheme = z.object({
  name: z.string().min(1, "required"),
});
export type IPositionForm = z.infer<typeof positionFormScheme>;
