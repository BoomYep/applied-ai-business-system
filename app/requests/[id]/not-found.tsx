import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
      <div className="space-y-3 text-center">
        <h1 className="text-4xl font-bold text-text-primary">
          Request Not Found
        </h1>
        <p className="text-lg text-text-secondary max-w-md">
          The request you are looking for does not exist or has been removed.
        </p>
      </div>

      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-background rounded-[var(--radius-md)] hover:bg-accent-hover transition-colors font-medium text-sm"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back to Dashboard
      </Link>
    </div>
  );
}
