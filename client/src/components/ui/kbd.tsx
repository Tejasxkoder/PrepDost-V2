import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function Kbd({ className, ...props }: ComponentProps<"kbd">) {
  return (
    <kbd
      className={cn(
        "rounded-[5px] border border-border bg-surface-strong px-1.5 py-0.5 font-mono text-[10.5px] text-fg-subtle",
        className,
      )}
      {...props}
    />
  );
}
