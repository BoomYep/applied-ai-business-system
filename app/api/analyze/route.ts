import { NextRequest, NextResponse } from "next/server";
import { analyzeRequest } from "@/lib/ai/analyze";
import { checkRateLimit } from "@/lib/rate-limit";

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  if (realIp) {
    return realIp;
  }

  return "unknown";
}

export async function POST(request: NextRequest) {
  try {
    const clientIp = getClientIp(request);

    const rateLimit = checkRateLimit(clientIp);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: "Too many requests. Please try again later.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": rateLimit.secondsUntilReset.toString(),
          },
        }
      );
    }

    const body = await request.json();

    if (typeof body.message !== "string") {
      return NextResponse.json(
        {
          error: "Invalid request: message must be a string",
        },
        { status: 400 }
      );
    }

    const message = body.message.trim();

    if (message.length < 10) {
      return NextResponse.json(
        {
          error: "Message must be at least 10 characters",
        },
        { status: 400 }
      );
    }

    if (message.length > 2000) {
      return NextResponse.json(
        {
          error: "Message must be less than 2000 characters",
        },
        { status: 400 }
      );
    }

    const analysis = await analyzeRequest(message);

    return NextResponse.json(analysis, { status: 200 });
  } catch (error) {
    console.error("Error in /api/analyze:", error);

    if (error instanceof Error && error.name === "AnalysisValidationError") {
      return NextResponse.json(
        {
          error:
            "Unable to analyze the request. Please try rephrasing your message.",
        },
        { status: 422 }
      );
    }

    return NextResponse.json(
      {
        error: "An error occurred while processing your request.",
      },
      { status: 500 }
    );
  }
}
