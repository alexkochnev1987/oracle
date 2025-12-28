"use client";

import { cn } from "@/lib/utils";

interface ErrorMessageProps {
  message: string;
  className?: string;
}

export function ErrorMessage({ message, className }: ErrorMessageProps) {
  return (
    <div
      className={cn(
        "rounded-md border border-red-500 bg-[rgba(26,26,58,0.8)] p-3",
        className
      )}
    >
      <p className="text-sm text-red-400">{message}</p>
    </div>
  );
}

