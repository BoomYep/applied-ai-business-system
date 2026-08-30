import { listRequests } from "@/lib/supabase/requests";
import { FilterBar } from "@/components/dashboard/FilterBar";
import { RequestsTable } from "@/components/dashboard/RequestsTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatRelativeTime } from "@/lib/utils/format-time";
import type { Department, Priority } from "@/types";

interface DashboardPageProps {
  searchParams: Promise<{
    department?: string;
    priority?: string;
  }>;
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const params = await searchParams;
  const department = params.department as Department | undefined;
  const priority = params.priority as Priority | undefined;

  const allRequests = await listRequests();
  const filteredRequests = await listRequests({
    department,
    priority,
  });

  const requestsWithFormattedTime = filteredRequests.map((request) => ({
    ...request,
    formattedCreatedAt: formatRelativeTime(request.createdAt),
  }));

  const hasFilters = Boolean(department || priority);
  const totalCount = allRequests.length;
  const filteredCount = filteredRequests.length;

  let subtitle: string;
  if (totalCount === 0) {
    subtitle = "No requests yet";
  } else if (hasFilters && filteredCount !== totalCount) {
    subtitle = `${filteredCount} of ${totalCount} requests`;
  } else {
    subtitle = `${totalCount} ${totalCount === 1 ? "request" : "requests"}`;
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-text-primary">
          Operations Dashboard
        </h1>
        <p className="text-sm text-text-secondary">{subtitle}</p>
      </div>

      <FilterBar />

      {requestsWithFormattedTime.length === 0 ? (
        <div className="border border-surface-border rounded-[var(--radius-lg)] bg-surface">
          {totalCount === 0 ? (
            <EmptyState
              title="No requests yet"
              description="Customer requests will appear here once they are analyzed and saved."
            />
          ) : (
            <EmptyState
              title="No requests match these filters"
              description="Try adjusting your filter criteria to see more results."
            />
          )}
        </div>
      ) : (
        <RequestsTable requests={requestsWithFormattedTime} />
      )}
    </div>
  );
}
