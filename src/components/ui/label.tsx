"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface LabelProps extends React.HTMLAttributes<HTMLLabelElement> {
  htmlFor?: string;
}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(({ className, htmlFor, ...props }, ref) => (
  <label
    ref={ref}
    htmlFor={htmlFor}
    className={cn("text-sm font-medium text-text-secondary mb-1.5 block", className)}
    {...props}
  />
));
Label.displayName = "Label";

export { Label };