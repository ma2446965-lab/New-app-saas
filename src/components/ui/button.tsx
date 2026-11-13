"use strict";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

// Lightweight cva replacement to avoid extra dependency
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
  "inline-flex items-center justify-center rounded-medium text-sm font-semibold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
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
