interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  loading?: boolean;
}

export function Button({
  variant = "primary",
  loading = false,
  disabled,
  children,
  className = "",
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background rounded-[var(--radius-md)]";

  const variantStyles = {
    primary: "bg-accent text-background hover:bg-accent-hover",
    secondary:
      "border border-surface-border bg-transparent text-text-primary hover:bg-surface",
    ghost: "bg-transparent text-text-secondary hover:bg-surface hover:text-text-primary",
  };

  const disabledStyles = disabled && !loading
    ? "opacity-40 bg-surface-border text-text-muted cursor-not-allowed hover:bg-surface-border"
    : "";

  const interactionStyles = disabled || loading ? "pointer-events-none" : "";

  return (
    <button
      className={`${baseStyles} ${!disabled || loading ? variantStyles[variant] : ""} ${disabledStyles} ${interactionStyles} ${className}`}
      disabled={disabled || loading}
      aria-disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          {children}
        </>
      ) : (
        children
      )}
    </button>
  );
}
