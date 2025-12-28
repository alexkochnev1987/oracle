import * as React from "react";

import { cn } from "@/lib/utils";

interface CheckboxProps extends React.ComponentProps<"input"> {
  error?: boolean;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, type = "checkbox", error = false, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "w-4 h-4 rounded border bg-[rgba(26,26,58,0.8)] text-[rgba(100,200,255,0.8)] transition-all duration-200",
          "focus:outline-none focus:ring-2 focus:ring-[rgba(100,200,255,0.5)] focus:ring-offset-0",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "cursor-pointer",
          error
            ? "border-red-500 focus:ring-red-500"
            : "border-[rgba(100,200,255,0.4)]",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Checkbox.displayName = "Checkbox";

export { Checkbox };

