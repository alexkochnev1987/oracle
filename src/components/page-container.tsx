"use client";

import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "full";
  paddingBottom?: string;
}

const maxWidthClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
  full: "max-w-full",
};

export function PageContainer({
  children,
  className,
  maxWidth = "full",
  paddingBottom = "pb-6 sm:pb-8",
}: PageContainerProps) {
  return (
    <main
      className={cn(
        "container mx-auto px-4 pt-7 sm:pt-8",
        paddingBottom,
        className
      )}
    >
      {maxWidth !== "full" ? (
        <div className={cn("mx-auto", maxWidthClasses[maxWidth])}>
          {children}
        </div>
      ) : (
        children
      )}
    </main>
  );
}

