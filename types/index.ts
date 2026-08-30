export type Intent =
  | "Appointment Request"
  | "Technical Support"
  | "Sales Inquiry"
  | "Billing Question"
  | "General Inquiry"
  | "Complaint"
  | "Follow-Up";

export type Priority = "Low" | "Normal" | "High" | "Urgent";

export type Department =
  | "Service"
  | "Sales"
  | "Billing"
  | "Customer Support"
  | "Operations";

export type RequestStatus = "New" | "In Review" | "In Progress" | "Completed";

export interface AnalysisResult {
  intent: Intent;
  priority: Priority;
  department: Department;
  suggestedAction: string;
  summary: string;
}

export interface CustomerRequest {
  id: string;
  customerName: string;
  email: string;
  phone: string | null;
  originalMessage: string;
  intent: Intent;
  priority: Priority;
  department: Department;
  suggestedAction: string;
  summary: string;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
}
