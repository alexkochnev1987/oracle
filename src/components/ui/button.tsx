import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-[#4a9eff] to-[#7c3aed] text-white hover:from-[#5bb0ff] hover:to-[#8b4afd] hover:shadow-[0_0_30px_rgba(100,200,255,0.6)] hover:-translate-y-0.5 active:scale-[0.98] focus:ring-[rgba(100,200,255,0.5)] mystical-glow",
        primary:
          "bg-gradient-to-r from-[#4a9eff] to-[#7c3aed] text-white hover:from-[#5bb0ff] hover:to-[#8b4afd] hover:shadow-[0_0_30px_rgba(100,200,255,0.6)] hover:-translate-y-0.5 active:scale-[0.98] focus:ring-[rgba(100,200,255,0.5)] mystical-glow",
        secondary:
          "bg-[rgba(100,200,255,0.15)] border border-[rgba(100,200,255,0.5)] text-white hover:bg-[rgba(100,200,255,0.25)] hover:border-[rgba(100,200,255,0.7)] focus:ring-[rgba(100,200,255,0.5)]",
        ghost:
          "text-white hover:bg-[rgba(100,200,255,0.1)] focus:ring-[rgba(100,200,255,0.5)]",
        destructive:
          "bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 hover:shadow-[0_0_20px_rgba(239,68,68,0.5)] focus:ring-red-500",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-12 sm:h-11 md:h-12 min-h-[48px] sm:min-h-[44px] px-6 py-3.5 text-base",
        sm: "h-10 min-h-[44px] px-4 py-2.5 text-sm",
        md: "h-12 sm:h-11 md:h-12 min-h-[48px] sm:min-h-[44px] px-6 py-3.5 text-base",
        lg: "h-14 sm:h-12 min-h-[56px] sm:min-h-[48px] px-8 py-4 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      icon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 sm:h-5 sm:w-5 animate-spin flex-shrink-0" />
            <span className="hidden sm:inline">Loading...</span>
          </>
        ) : (
          <>
            {icon && (
              <span className="h-5 w-5 sm:h-5 sm:w-5 flex-shrink-0 flex items-center justify-center">
                {icon}
              </span>
            )}
            {children}
          </>
        )}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
