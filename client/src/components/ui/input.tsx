import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends ComponentProps<"input"> {
  /** Decorative icon rendered inside the left edge. */
  icon?: ReactNode;
  /** Interactive element rendered inside the right edge (e.g. show/hide password). */
  trailing?: ReactNode;
  invalid?: boolean;
}

export function Input({ className, icon, trailing, invalid, ref, ...props }: InputProps) {
  return (
    <div className="relative">
      {icon ? (
        <span
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-3 grid -translate-y-1/2 text-fg-subtle [&_svg]:size-[15px]"
        >
          {icon}
        </span>
      ) : null}
      <input
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cn(
          "w-full rounded-sm border border-border bg-surface-strong py-[11px] text-sm text-fg transition-colors outline-none placeholder:text-fg-subtle focus:border-accent/60 aria-invalid:border-rose/60",
          icon ? "pl-9" : "pl-3.5",
          trailing ? "pr-10" : "pr-3.5",
          className,
        )}
        {...props}
      />
      {trailing ? (
        <span className="absolute top-1/2 right-2 -translate-y-1/2">{trailing}</span>
      ) : null}
    </div>
  );
}
