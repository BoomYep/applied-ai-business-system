import { NextRequest, NextResponse } from "next/server";
import { requestSchema } from "@/lib/validation/request.schema";
import { analysisSchema } from "@/lib/validation/analysis.schema";
import { insertRequest } from "@/lib/supabase/requests";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const customerValidation = requestSchema.safeParse({
      customerName: body.customerName,
      email: body.email,
      phone: body.phone,
      message: body.message,
    });

    if (!customerValidation.success) {
      return NextResponse.json(
        {
          error: "Invalid customer data",
        },
        { status: 400 }
      );
    }

    const analysisValidation = analysisSchema.safeParse({
      intent: body.intent,
      priority: body.priority,
      department: body.department,
      suggestedAction: body.suggestedAction,
      summary: body.summary,
    });

    if (!analysisValidation.success) {
      return NextResponse.json(
        {
          error: "Invalid analysis data",
        },
        { status: 400 }
      );
    }

    const customerData = customerValidation.data;
    const analysisData = analysisValidation.data;

    const createdRequest = await insertRequest({
      customerName: customerData.customerName,
      email: customerData.email,
      phone: customerData.phone,
      originalMessage: customerData.message,
      intent: analysisData.intent,
      priority: analysisData.priority,
      department: analysisData.department,
      suggestedAction: analysisData.suggestedAction,
      summary: analysisData.summary,
    });

    return NextResponse.json(
      {
        id: createdRequest.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in /api/requests POST:", error);

    return NextResponse.json(
      {
        error: "Failed to save request",
      },
      { status: 500 }
    );
  }
}
