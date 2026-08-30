import { z } from "zod";

export const requestSchema = z.object({
  customerName: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().max(30, "Phone must be less than 30 characters").optional(),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(2000, "Message must be less than 2000 characters"),
});

export type RequestFormData = z.infer<typeof requestSchema>;
