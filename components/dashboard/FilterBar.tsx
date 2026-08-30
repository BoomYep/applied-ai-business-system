"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { Department, Priority } from "@/types";

const DEPARTMENTS: (Department | "All")[] = [
  "All",
  "Service",
  "Sales",
  "Billing",
  "Customer Support",
  "Operations",
];

const PRIORITIES: (Priority | "All")[] = ["All", "Low", "Normal", "High", "Urgent"];

export function FilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentDepartment = (searchParams.get("department") as Department | null) || "All";
  const currentPriority = (searchParams.get("priority") as Priority | null) || "All";

  const hasActiveFilters = currentDepartment !== "All" || currentPriority !== "All";

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value === "All") {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    router.push(`/dashboard?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push("/dashboard");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-text-secondary">
            Department:
          </span>
          <div className="flex flex-wrap gap-2">
            {DEPARTMENTS.map((dept) => {
              const isActive = dept === currentDepartment;
              return (
                <button
                  key={dept}
                  onClick={() => updateFilter("department", dept)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                    isActive
                      ? "bg-accent text-background"
                      : "bg-surface text-text-secondary hover:bg-surface-border hover:text-text-primary border border-surface-border"
                  }`}
                >
                  {dept}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-text-secondary">
            Priority:
          </span>
          <div className="flex flex-wrap gap-2">
            {PRIORITIES.map((priority) => {
              const isActive = priority === currentPriority;
              return (
                <button
                  key={priority}
                  onClick={() => updateFilter("priority", priority)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                    isActive
                      ? "bg-accent text-background"
                      : "bg-surface text-text-secondary hover:bg-surface-border hover:text-text-primary border border-surface-border"
                  }`}
                >
                  {priority}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="text-sm text-accent hover:text-accent-hover transition-colors"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
