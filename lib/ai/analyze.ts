import "server-only";
import { anthropic } from "./client";
import { CLASSIFICATION_SYSTEM_PROMPT } from "./prompt";
import { analysisSchema } from "@/lib/validation/analysis.schema";
import type { AnalysisResult } from "@/types";

class AnalysisValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AnalysisValidationError";
  }
}

async function callModel(message: string): Promise<string> {
  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 500,
    temperature: 0,
    system: CLASSIFICATION_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: message,
      },
    ],
  });

  const textContent = response.content.find((block) => block.type === "text");

  if (!textContent || textContent.type !== "text") {
    throw new Error("No text content in response");
  }

  return textContent.text;
}

function stripMarkdownFences(text: string): string {
  return text.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "");
}

function parseAndValidate(text: string): AnalysisResult {
  const cleaned = stripMarkdownFences(text.trim());
  const parsed = JSON.parse(cleaned);
  const validated = analysisSchema.parse(parsed);
  return validated;
}

export async function analyzeRequest(
  message: string
): Promise<AnalysisResult> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const responseText = await callModel(message);
      return parseAndValidate(responseText);
    } catch (error) {
      lastError = error as Error;

      if (attempt === 1) {
        console.warn(
          `Analysis validation failed on attempt ${attempt}, retrying...`,
          error
        );
        continue;
      }
    }
  }

  throw new AnalysisValidationError(
    `AI response validation failed after 2 attempts: ${lastError?.message}`
  );
}
