import { z } from "zod";

export const analysisSchema = z.object({
  intent: z.enum([
    "Appointment Request",
    "Technical Support",
    "Sales Inquiry",
    "Billing Question",
    "General Inquiry",
    "Complaint",
    "Follow-Up",
  ]),
  priority: z.enum(["Low", "Normal", "High", "Urgent"]),
  department: z.enum([
    "Service",
    "Sales",
    "Billing",
    "Customer Support",
    "Operations",
  ]),
  suggestedAction: z
    .string()
    .min(1, "Suggested action is required")
    .max(300, "Suggested action must be less than 300 characters"),
  summary: z
    .string()
    .min(1, "Summary is required")
    .max(500, "Summary must be less than 500 characters"),
});

export type AnalysisData = z.infer<typeof analysisSchema>;
