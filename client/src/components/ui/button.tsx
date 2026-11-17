import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-sm text-[12.5px] font-semibold whitespace-nowrap transition-[color,background,border-color,filter] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "border border-accent bg-accent text-on-accent hover:brightness-110",
        secondary: "border border-border bg-surface-strong text-fg hover:border-accent/30",
        ghost: "text-fg-muted hover:bg-surface hover:text-fg",
        danger: "border border-rose/30 bg-rose/10 text-rose hover:bg-rose/20",
      },
      size: {
        sm: "h-8 px-3",
        md: "h-9 px-4",
        lg: "h-11 px-5 text-[13.5px]",
        icon: "size-[38px] border border-border bg-surface text-fg-muted hover:border-accent/30 hover:text-fg [&_svg]:size-[17px]",
      },
    },
    defaultVariants: { variant: "secondary", size: "md" },
  },
);

export interface ButtonProps extends ComponentProps<"button">, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({ className, variant, size, asChild = false, type, ...props }: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button";
  return (
    <Comp
      data-slot="button"
      type={asChild ? undefined : (type ?? "button")}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
