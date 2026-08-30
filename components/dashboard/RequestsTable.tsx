"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import type { CustomerRequest } from "@/types";

interface RequestsTableProps {
  requests: Array<
    CustomerRequest & {
      formattedCreatedAt: string;
    }
  >;
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
}

export function RequestsTable({ requests }: RequestsTableProps) {
  return (
    <>
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-surface-border">
              <th className="text-left py-3 px-4 text-xs font-semibold text-text-secondary uppercase tracking-wide">
                Customer
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-text-secondary uppercase tracking-wide">
                Request
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-text-secondary uppercase tracking-wide">
                Intent
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-text-secondary uppercase tracking-wide">
                Priority
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-text-secondary uppercase tracking-wide">
                Department
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-text-secondary uppercase tracking-wide">
                Status
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-text-secondary uppercase tracking-wide">
                Created
              </th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => (
              <tr
                key={request.id}
                className="border-b border-surface-border hover:bg-surface transition-colors"
              >
                <td className="py-4 px-4">
                  <Link
                    href={`/requests/${request.id}`}
                    className="block group"
                  >
                    <div className="text-sm font-medium text-text-primary group-hover:text-accent transition-colors">
                      {request.customerName}
                    </div>
                    <div className="text-xs text-text-muted">
                      {request.email}
                    </div>
                  </Link>
                </td>
                <td className="py-4 px-4">
                  <Link
                    href={`/requests/${request.id}`}
                    className="block text-sm text-text-secondary hover:text-text-primary transition-colors"
                  >
                    {truncateText(request.originalMessage, 60)}
                  </Link>
                </td>
                <td className="py-4 px-4">
                  <Link
                    href={`/requests/${request.id}`}
                    className="block text-sm text-text-primary"
                  >
                    {request.intent}
                  </Link>
                </td>
                <td className="py-4 px-4">
                  <Link href={`/requests/${request.id}`} className="block">
                    <Badge variant={request.priority} />
                  </Link>
                </td>
                <td className="py-4 px-4">
                  <Link
                    href={`/requests/${request.id}`}
                    className="block text-sm text-text-primary"
                  >
                    {request.department}
                  </Link>
                </td>
                <td className="py-4 px-4">
                  <Link href={`/requests/${request.id}`} className="block">
                    <Badge variant={request.status} />
                  </Link>
                </td>
                <td className="py-4 px-4">
                  <Link
                    href={`/requests/${request.id}`}
                    className="block text-sm text-text-muted"
                  >
                    {request.formattedCreatedAt}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-4">
        {requests.map((request) => (
          <Link
            key={request.id}
            href={`/requests/${request.id}`}
            className="block p-4 bg-surface border border-surface-border rounded-[var(--radius-md)] hover:border-accent transition-colors"
          >
            <div className="space-y-3">
              <div>
                <div className="text-sm font-medium text-text-primary">
                  {request.customerName}
                </div>
                <div className="text-xs text-text-muted">{request.email}</div>
              </div>

              <p className="text-sm text-text-secondary">
                {truncateText(request.originalMessage, 80)}
              </p>

              <div className="flex flex-wrap gap-2">
                <Badge variant={request.priority} />
                <Badge variant={request.status} />
              </div>

              <div className="text-xs text-text-muted">
                {request.formattedCreatedAt}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
