"use client";

import { Popover as Primitive } from "radix-ui";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export const Popover = Primitive.Root;
export const PopoverTrigger = Primitive.Trigger;

export function PopoverContent({
  className,
  sideOffset = 10,
  align = "end",
  ...props
}: ComponentProps<typeof Primitive.Content>) {
  return (
    <Primitive.Portal>
      <Primitive.Content
        sideOffset={sideOffset}
        align={align}
        className={cn(
          "z-50 w-[min(320px,calc(100vw-24px))] overflow-hidden rounded-md border border-border bg-bg-elevated shadow-[0_18px_44px_rgba(0,0,0,0.45)]",
          className,
        )}
        {...props}
      />
    </Primitive.Portal>
  );
}
