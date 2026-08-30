import "server-only";
import { supabase } from "./server";
import type {
  CustomerRequest,
  Department,
  Priority,
  RequestStatus,
} from "@/types";

interface DatabaseRow {
  id: string;
  customer_name: string;
  email: string;
  phone: string | null;
  original_message: string;
  intent: CustomerRequest["intent"];
  priority: Priority;
  department: Department;
  suggested_action: string;
  summary: string;
  status: RequestStatus;
  created_at: string;
  updated_at: string;
}

function mapRowToRequest(row: DatabaseRow): CustomerRequest {
  return {
    id: row.id,
    customerName: row.customer_name,
    email: row.email,
    phone: row.phone,
    originalMessage: row.original_message,
    intent: row.intent,
    priority: row.priority,
    department: row.department,
    suggestedAction: row.suggested_action,
    summary: row.summary,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

interface ListRequestsFilters {
  department?: Department;
  priority?: Priority;
  status?: RequestStatus;
}

export async function listRequests(
  filters?: ListRequestsFilters
): Promise<CustomerRequest[]> {
  let query = supabase
    .from("customer_requests")
    .select("*")
    .order("created_at", { ascending: false });

  if (filters?.department) {
    query = query.eq("department", filters.department);
  }

  if (filters?.priority) {
    query = query.eq("priority", filters.priority);
  }

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to list requests: ${error.message}`);
  }

  return (data as DatabaseRow[]).map(mapRowToRequest);
}

export async function getRequestById(
  id: string
): Promise<CustomerRequest | null> {
  const { data, error } = await supabase
    .from("customer_requests")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw new Error(`Failed to get request: ${error.message}`);
  }

  return mapRowToRequest(data as DatabaseRow);
}

interface InsertRequestData {
  customerName: string;
  email: string;
  phone?: string;
  originalMessage: string;
  intent: CustomerRequest["intent"];
  priority: Priority;
  department: Department;
  suggestedAction: string;
  summary: string;
}

export async function insertRequest(
  data: InsertRequestData
): Promise<CustomerRequest> {
  const { data: row, error } = await supabase
    .from("customer_requests")
    .insert({
      customer_name: data.customerName,
      email: data.email,
      phone: data.phone || null,
      original_message: data.originalMessage,
      intent: data.intent,
      priority: data.priority,
      department: data.department,
      suggested_action: data.suggestedAction,
      summary: data.summary,
      status: "New",
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to insert request: ${error.message}`);
  }

  return mapRowToRequest(row as DatabaseRow);
}

export async function updateRequestStatus(
  id: string,
  status: RequestStatus
): Promise<CustomerRequest> {
  const { data: row, error } = await supabase
    .from("customer_requests")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      throw new Error("Request not found");
    }
    throw new Error(`Failed to update request status: ${error.message}`);
  }

  return mapRowToRequest(row as DatabaseRow);
}
