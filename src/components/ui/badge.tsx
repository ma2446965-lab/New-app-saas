"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "destructive" | "info";
}

const badgeVariants = {
  default: "bg-border-subtle text-text-secondary",
  success: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
  warning: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
  destructive: "bg-red-500/20 text-red-400 border border-red-500/30",
  info: "bg-neon-blue-500/20 text-neon-blue-400 border border-neon-blue-500/30",
} as const;

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(({ className, variant = "default", ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border",
      badgeVariants[variant],
      className
    )}
    {...props}
  />
));
Badge.displayName = "Badge";

export { Badge, badgeVariants };