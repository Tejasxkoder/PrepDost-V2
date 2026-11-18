import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11.5px] leading-none font-medium whitespace-nowrap",
  {
    variants: {
      tone: {
        neutral: "border-border bg-surface-strong text-fg-muted",
        accent: "border-accent/30 bg-accent/10 text-accent",
        amber: "border-amber/30 bg-amber/10 text-amber",
        rose: "border-rose/30 bg-rose/10 text-rose",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

export interface BadgeProps extends ComponentProps<"span">, VariantProps<typeof badgeVariants> {}

export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}

/** easy → accent, medium → amber, hard → rose (same mapping as the prototype). */
export const DIFFICULTY_TONE = { easy: "accent", medium: "amber", hard: "rose" } as const;
