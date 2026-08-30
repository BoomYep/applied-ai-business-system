"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navigation() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(path);
  };

  return (
    <nav className="border-b border-surface-border bg-background">
      <div className="w-full max-w-[1100px] mx-auto px-4 sm:px-8">
        <div className="flex items-center gap-6 h-14">
          <Link
            href="/"
            className={`text-sm font-medium transition-colors ${
              isActive("/")
                ? "text-accent"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            New Request
          </Link>
          <Link
            href="/dashboard"
            className={`text-sm font-medium transition-colors ${
              isActive("/dashboard")
                ? "text-accent"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            Dashboard
          </Link>
        </div>
      </div>
    </nav>
  );
}
