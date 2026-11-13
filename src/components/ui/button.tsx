"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

function cva(base: string, opts: { variants?: Record<string, Record<string, string>>; defaultVariants?: Record<string, string> } = {}) {
  return (props: Record<string, any> = {}) => {
    let cls = base;
    if (opts.variants) {
      Object.entries(opts.variants).forEach(([variant, values]) => {
        const val = props[variant];
        if (val && values[val]) cls += " " + values[val];
      });
    }
    return cn(cls, props.className);
  };
}

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-medium text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-br from-neon-blue-600 to-electric-purple-600 text-white hover:from-neon-blue-500 hover:to-electric-purple-500 shadow-glow-purple hover:shadow-[0_0_30px_rgba(168,85,247,0.5)]",
        destructive:
          "bg-red-600 text-white hover:bg-red-700 shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:shadow-[0_0_30px_rgba(220,38,38,0.5)]",
        outline:
          "border border-border-subtle bg-transparent hover:bg-bg-card-hover hover:text-text-primary",
        secondary:
          "bg-bg-card text-text-primary hover:bg-bg-card-hover shadow-glow-card",
        ghost:
          "hover:bg-bg-card-hover hover:text-text-primary",
        link:
          "text-neon-blue-600 hover:text-neon-blue-400 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-medium px-3",
        lg: "h-11 rounded-medium px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  as?: React.ElementType;
  href?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, asChild = false, as, ...props }, ref) => {
  const Comp = asChild ? (as || Slot) : "button";
  return (
    <Comp
      ref={ref}
      className={buttonVariants({ variant, size, className })}
      {...props}
    />
  );
});
Button.displayName = "Button";

export { Button, buttonVariants };