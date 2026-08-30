import { notFound } from "next/navigation";
import Link from "next/link";
import { getRequestById } from "@/lib/supabase/requests";
import { Badge } from "@/components/ui/Badge";
import { StatusControl } from "@/components/dashboard/StatusControl";
import { formatAbsoluteDate } from "@/lib/utils/format-date";

interface RequestDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function RequestDetailPage({
  params,
}: RequestDetailPageProps) {
  const { id } = await params;
  const request = await getRequestById(id);

  if (!request) {
    notFound();
  }

  const formattedCreatedAt = formatAbsoluteDate(request.createdAt);
  const formattedUpdatedAt = formatAbsoluteDate(request.updatedAt);

  return (
    <div className="space-y-8">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
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

      <div className="space-y-8">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-text-primary">
            Request Details
          </h1>

          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <span className="text-sm font-medium text-text-secondary">
                  Customer Name
                </span>
                <div className="text-base text-text-primary">
                  {request.customerName}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-sm font-medium text-text-secondary">
                  Email
                </span>
                <div className="text-base text-text-primary">
                  {request.email}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-sm font-medium text-text-secondary">
                  Phone
                </span>
                <div className="text-base text-text-primary">
                  {request.phone || "Not provided"}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">
            Original Request
          </h2>
          <div className="p-4 bg-surface border-l-4 border-surface-border rounded-[var(--radius-md)]">
            <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">
              {request.originalMessage}
            </p>
          </div>
        </div>

        <div className="border-t border-surface-border pt-8 space-y-6">
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">
            AI Analysis
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">
                Intent
              </label>
              <div className="text-base text-text-primary">{request.intent}</div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">
                Department
              </label>
              <div className="text-base text-text-primary">
                {request.department}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">
                Priority
              </label>
              <div>
                <Badge variant={request.priority} />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary">
              Suggested Action
            </label>
            <p className="text-sm text-text-primary leading-relaxed">
              {request.suggestedAction}
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary">
              Summary
            </label>
            <p className="text-sm text-text-primary leading-relaxed">
              {request.summary}
            </p>
          </div>
        </div>

        <div className="border-t border-surface-border pt-8 space-y-6">
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">
            Status
          </h2>

          <StatusControl requestId={request.id} currentStatus={request.status} />
        </div>

        <div className="border-t border-surface-border pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-text-muted">Created: </span>
              <span className="text-text-secondary">{formattedCreatedAt}</span>
            </div>
            <div>
              <span className="text-text-muted">Last updated: </span>
              <span className="text-text-secondary">{formattedUpdatedAt}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
