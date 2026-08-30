interface FieldProps {
  label: string;
  error?: string;
  type?: "input" | "textarea";
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  textareaProps?: React.TextareaHTMLAttributes<HTMLTextAreaElement>;
}

export function Field({
  label,
  error,
  type = "input",
  inputProps,
  textareaProps,
}: FieldProps) {
  const baseInputStyles =
    "w-full px-3 py-2 bg-surface border border-surface-border rounded-[var(--radius-md)] text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors";

  const errorStyles = error ? "border-priority-urgent focus:ring-priority-urgent" : "";

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-text-secondary">{label}</label>
      {type === "input" ? (
        <input
          className={`${baseInputStyles} ${errorStyles}`}
          {...inputProps}
        />
      ) : (
        <textarea
          className={`${baseInputStyles} ${errorStyles} min-h-[100px] resize-y`}
          {...textareaProps}
        />
      )}
      {error && (
        <span className="text-xs text-priority-urgent">{error}</span>
      )}
    </div>
  );
}
