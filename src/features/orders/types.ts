
import { z } from "zod";

export const orderFormSchema = z.object({
  user_id: z.string().min(1, { message: "User is required" }),
  product_id: z.string().min(1, { message: "Product is required" }),
  measurement_id: z.string().optional(),
  quantity: z.coerce.number().int().min(1, { message: "Quantity must be at least 1" }),
  notes: z.string().optional(),
});

export type OrderFormValues = z.infer<typeof orderFormSchema>;

export interface NewOrderProps {
  isOrgAdmin: boolean;
}

