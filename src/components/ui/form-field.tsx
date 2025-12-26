"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Label } from "./label";

interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

export function FormField({
  label,
  error,
  required = false,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-2.5 sm:space-y-3", className)}>
      <Label className="block text-sm sm:text-base font-medium text-white mb-1">
        {label}
        {required && <span className="text-red-400 ml-1.5">*</span>}
      </Label>
      {children}
      {error && (
        <p className="text-xs sm:text-sm text-red-400 mt-1.5">{error}</p>
      )}
    </div>
  );
}

