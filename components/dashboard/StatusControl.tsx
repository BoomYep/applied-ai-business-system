"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { RequestStatus } from "@/types";

const STATUSES: RequestStatus[] = [
  "New",
  "In Review",
  "In Progress",
  "Completed",
];

interface StatusControlProps {
  requestId: string;
  currentStatus: RequestStatus;
}

export function StatusControl({
  requestId,
  currentStatus,
}: StatusControlProps) {
  const router = useRouter();
  const [status, setStatus] = useState<RequestStatus>(currentStatus);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStatusChange = async (newStatus: RequestStatus) => {
    if (newStatus === status || isUpdating) return;

    const previousStatus = status;
    setStatus(newStatus);
    setError(null);
    setIsUpdating(true);

    try {
      const response = await fetch(`/api/requests/${requestId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update status");
      }

      router.refresh();
      setIsUpdating(false);
    } catch (err) {
      setStatus(previousStatus);
      setError(err instanceof Error ? err.message : "Failed to update status");
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {STATUSES.map((statusOption) => {
          const isActive = statusOption === status;
          return (
            <button
              key={statusOption}
              onClick={() => handleStatusChange(statusOption)}
              disabled={isUpdating}
              className={`px-4 py-2 text-sm font-medium rounded-[var(--radius-md)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                isActive
                  ? "bg-accent text-background"
                  : "bg-surface text-text-primary border border-surface-border hover:bg-surface-border"
              }`}
            >
              {statusOption}
            </button>
          );
        })}
      </div>

      {error && (
        <div className="text-sm text-priority-urgent">{error}</div>
      )}
    </div>
  );
}
