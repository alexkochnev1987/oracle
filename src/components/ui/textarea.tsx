import * as React from "react";

import { cn } from "@/lib/utils";

interface TextareaProps extends React.ComponentProps<"textarea"> {
  error?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error = false, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "w-full rounded-md border bg-[rgba(26,26,58,0.8)] px-4 py-3.5 text-base sm:text-base md:text-lg text-white placeholder:text-[#6b7280] transition-all duration-200 ease-in-out",
          "focus:outline-none focus:border-[rgba(100,200,255,0.8)] focus:shadow-[0_0_0_3px_rgba(100,200,255,0.2)]",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "min-h-[100px] resize-y leading-relaxed",
          error
            ? "border-red-500 focus:border-red-500 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.2)]"
            : "border-[rgba(100,200,255,0.5)]",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
