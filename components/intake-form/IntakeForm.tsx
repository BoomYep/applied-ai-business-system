"use client";

import { useState } from "react";
import { requestSchema, type RequestFormData } from "@/lib/validation/request.schema";
import { Field } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

export function IntakeForm() {
  const [formData, setFormData] = useState<RequestFormData>({
    customerName: "",
    email: "",
    phone: "",
    message: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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

      console.log("Validated form data:", validatedData);

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
