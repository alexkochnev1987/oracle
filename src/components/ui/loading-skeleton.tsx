"use client";

import { cn } from "@/lib/utils";
import { Skeleton } from "./skeleton";

interface LoadingSkeletonProps {
  variant?: "card" | "text" | "image";
  count?: number;
  className?: string;
}

export function LoadingSkeleton({
  variant = "card",
  count = 1,
  className,
}: LoadingSkeletonProps) {
  const variants = {
    card: "h-32 w-full rounded-lg",
    text: "h-4 w-full rounded",
    image: "aspect-video w-full rounded-lg",
  };

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            "bg-[rgba(26,26,58,0.6)]",
            variants[variant],
            className
          )}
        />
      ))}
    </>
  );
}

