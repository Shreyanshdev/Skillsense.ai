// src/components/AIChat/input.tsx
import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      // Removed fixed border/shadow here to allow parent to define it based on its container
      // The parent (ChatPage) will wrap this <Input> with a div that has the desired border/shadow/bg
      className={cn(
        "flex w-full text-base bg-transparent transition-colors resize-none overflow-hidden",
        "focus-visible:outline-none focus-visible:ring-0", // No ring here, parent will handle focus visual
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea as Input };