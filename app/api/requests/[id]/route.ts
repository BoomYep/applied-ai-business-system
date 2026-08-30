import { NextRequest, NextResponse } from "next/server";
import { updateRequestStatus } from "@/lib/supabase/requests";
import type { RequestStatus } from "@/types";

const VALID_STATUSES: RequestStatus[] = [
  "New",
  "In Review",
  "In Progress",
  "Completed",
];

function isValidUUID(id: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!isValidUUID(id)) {
      return NextResponse.json(
        {
          error: "Invalid request ID",
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    if (!body.status || !VALID_STATUSES.includes(body.status)) {
      return NextResponse.json(
        {
          error: "Invalid status. Must be one of: New, In Review, In Progress, Completed",
        },
        { status: 400 }
      );
    }

    const updatedRequest = await updateRequestStatus(
      id,
      body.status as RequestStatus
    );

    return NextResponse.json(updatedRequest, { status: 200 });
  } catch (error) {
    console.error("Error in PATCH /api/requests/[id]:", error);

    if (error instanceof Error && error.message.includes("not found")) {
      return NextResponse.json(
        {
          error: "Request not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to update request",
      },
      { status: 500 }
    );
  }
}
