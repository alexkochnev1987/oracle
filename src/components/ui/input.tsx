import * as React from "react"

import { cn } from "@/lib/utils"

interface InputProps extends React.ComponentProps<"input"> {
  error?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error = false, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "w-full rounded-md border bg-[rgba(26,26,58,0.8)] px-4 py-3.5 text-base text-white placeholder:text-[#6b7280] transition-all duration-200 ease-in-out",
          "focus:outline-none focus:border-[rgba(100,200,255,0.8)] focus:shadow-[0_0_0_3px_rgba(100,200,255,0.2)]",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "h-12 sm:h-11 md:h-12 min-h-[48px] sm:min-h-[44px]",
          error
            ? "border-red-500 focus:border-red-500 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.2)]"
            : "border-[rgba(100,200,255,0.5)]",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
