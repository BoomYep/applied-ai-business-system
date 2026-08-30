interface BadgeProps {
  variant:
    | "Low"
    | "Normal"
    | "High"
    | "Urgent"
    | "New"
    | "In Review"
    | "In Progress"
    | "Completed";
  className?: string;
}

export function Badge({ variant, className = "" }: BadgeProps) {
  const baseStyles =
    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";

  const variantStyles: Record<BadgeProps["variant"], string> = {
    Low: "bg-transparent text-priority-low border border-priority-low/30",
    Normal:
      "bg-priority-normal/5 text-priority-normal border border-priority-normal/30",
    High: "bg-priority-high/5 text-priority-high border border-priority-high/30",
    Urgent:
      "bg-priority-urgent/5 text-priority-urgent border border-priority-urgent/30",
    New: "bg-transparent text-status-new border border-status-new/40",
    "In Review":
      "bg-transparent text-status-in-review border border-status-in-review/40",
    "In Progress":
      "bg-status-in-progress/10 text-status-in-progress border border-status-in-progress/40",
    Completed:
      "bg-transparent text-status-completed/70 border border-status-completed/25",
  };

  return (
    <span className={`${baseStyles} ${variantStyles[variant]} ${className}`}>
      {variant}
    </span>
  );
}
