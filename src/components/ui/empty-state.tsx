"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 sm:p-12",
        className
      )}
    >
      {icon && (
        <div className="mb-4 text-[rgba(100,200,255,0.5)]">
          {icon}
        </div>
      )}
      <h3 className="text-xl sm:text-2xl font-semibold text-white mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-sm sm:text-base text-[#9ca3af] mb-6 max-w-md">
          {description}
        </p>
      )}
      {action && <div className="flex justify-center">{action}</div>}
    </div>
  );
}

