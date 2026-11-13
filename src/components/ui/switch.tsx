"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitive.Root
    ref={ref}
    className={cn(
      "inline-flex items-center shrink-0 cursor-pointer select-none rounded-full border-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-blue-600 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=checked]:bg-neon-blue-600 data-[state=unchecked]:bg-input",
      className
    )}
    {...props}
  >
    <SwitchPrimitive.Thumb className="pointer-events-none block rounded-full bg-background shadow-ring shadow-data-[state=checked]:ring-ring data-[state=checked]:translate-x-5" />
  </SwitchPrimitive.Root>
));
Switch.displayName = SwitchPrimitive.Root.displayName;

export { Switch };