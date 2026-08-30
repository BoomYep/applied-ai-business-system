"use client";

import { useState } from "react";
import { requestSchema, type RequestFormData } from "@/lib/validation/request.schema";
import { Field } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import type { AnalysisResult } from "@/types";

interface IntakeFormProps {
  onAnalysisComplete: (data: {
    customerName: string;
    email: string;
    originalMessage: string;
    analysis: AnalysisResult;
    saveWarning?: string;
  }) => void;
}

export function IntakeForm({ onAnalysisComplete }: IntakeFormProps) {
  const [formData, setFormData] = useState<RequestFormData>({
    customerName: "",
    email: "",
    phone: "",
    message: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const validateField = (name: keyof RequestFormData, value: string) => {
    try {
      requestSchema.shape[name].parse(value);
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    } catch (err: unknown) {
      if (err && typeof err === "object" && "errors" in err) {
        const zodError = err as { errors: Array<{ message: string }> };
        setErrors((prev) => ({
          ...prev,
          [name]: zodError.errors[0].message,
        }));
      }
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    validateField(name as keyof RequestFormData, value);
  };

  const isFormValid = () => {
    try {
      requestSchema.parse(formData);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const validatedData = requestSchema.parse(formData);
      setIsSubmitting(true);
      setApiError(null);

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: validatedData.message }),
      });

      if (!response.ok) {
        const errorData = await response.json();

        if (response.status === 429) {
          const retryAfter = response.headers.get("Retry-After");
          setApiError(
            `${errorData.error}${retryAfter ? ` Please wait ${retryAfter} seconds.` : ""}`
          );
          setIsSubmitting(false);
          return;
        }

        if (response.status === 422) {
          setApiError(errorData.error);
          setIsSubmitting(false);
          return;
        }

        setApiError(errorData.error || "An error occurred");
        setIsSubmitting(false);
        return;
      }

      const analysis = await response.json();

      let saveWarning: string | undefined;

      try {
        const saveResponse = await fetch("/api/requests", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            customerName: validatedData.customerName,
            email: validatedData.email,
            phone: validatedData.phone,
            message: validatedData.message,
            intent: analysis.intent,
            priority: analysis.priority,
            department: analysis.department,
            suggestedAction: analysis.suggestedAction,
            summary: analysis.summary,
          }),
        });

        if (!saveResponse.ok) {
          saveWarning =
            "Analysis completed successfully, but could not be saved to the database.";
        }
      } catch {
        saveWarning =
          "Analysis completed successfully, but could not be saved to the database.";
      }

      onAnalysisComplete({
        customerName: validatedData.customerName,
        email: validatedData.email,
        originalMessage: validatedData.message,
        analysis,
        saveWarning,
      });

      setIsSubmitting(false);
    } catch (err: unknown) {
      if (err && typeof err === "object" && "errors" in err) {
        const zodError = err as {
          errors: Array<{ path: Array<string>; message: string }>;
        };
        const fieldErrors: Record<string, string> = {};
        zodError.errors.forEach((error) => {
          const field = error.path[0];
          fieldErrors[field] = error.message;
        });
        setErrors(fieldErrors);
      } else {
        setApiError("Network error. Please check your connection and try again.");
      }
      setIsSubmitting(false);
    }
  };

  const messageLength = formData.message.length;
  const messageMaxLength = 2000;
  const messageRemaining = messageMaxLength - messageLength;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <Field
          label="Name"
          type="input"
          error={errors.customerName}
          inputProps={{
            name: "customerName",
            value: formData.customerName,
            onChange: handleChange,
            placeholder: "John Smith",
            autoComplete: "name",
          }}
        />

        <Field
          label="Email"
          type="input"
          error={errors.email}
          inputProps={{
            name: "email",
            type: "email",
            value: formData.email,
            onChange: handleChange,
            placeholder: "john@example.com",
            autoComplete: "email",
          }}
        />

        <Field
          label="Phone (optional)"
          type="input"
          error={errors.phone}
          inputProps={{
            name: "phone",
            type: "tel",
            value: formData.phone,
            onChange: handleChange,
            placeholder: "+1 (555) 123-4567",
            autoComplete: "tel",
          }}
        />

        <div className="space-y-1.5">
          <Field
            label="Customer Request"
            type="textarea"
            error={errors.message}
            textareaProps={{
              name: "message",
              value: formData.message,
              onChange: handleChange,
              placeholder: "Describe your request in detail...",
              rows: 6,
            }}
          />
          <div className="flex justify-end">
            <span
              className={`text-xs ${
                messageRemaining < 0
                  ? "text-priority-urgent"
                  : messageRemaining < 100
                  ? "text-priority-high"
                  : "text-text-muted"
              }`}
            >
              {messageRemaining} characters remaining
            </span>
          </div>
        </div>
      </div>

      {apiError && (
        <div className="p-3 bg-priority-urgent/10 border border-priority-urgent/30 rounded-[var(--radius-md)] text-sm text-priority-urgent">
          {apiError}
        </div>
      )}

      <Button
        type="submit"
        variant="primary"
        disabled={!isFormValid() || isSubmitting}
        loading={isSubmitting}
      >
        Analyze Request
      </Button>
    </form>
  );
}
