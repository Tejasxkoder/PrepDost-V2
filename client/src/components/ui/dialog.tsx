"use client";

import { Dialog as DialogPrimitive } from "radix-ui";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;
export const DialogTitle = DialogPrimitive.Title;
export const DialogDescription = DialogPrimitive.Description;

interface DialogContentProps extends ComponentProps<typeof DialogPrimitive.Content> {
  overlayClassName?: string;
}

export function DialogContent({
  className,
  overlayClassName,
  children,
  ...props
}: DialogContentProps) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay
        className={cn("fixed inset-0 z-100 bg-black/55 backdrop-blur-[3px]", overlayClassName)}
      />
      <DialogPrimitive.Content
        className={cn(
          "fixed top-[14vh] left-1/2 z-100 w-[min(560px,92vw)] -translate-x-1/2 overflow-hidden rounded-2xl border border-border bg-bg-elevated shadow-[0_30px_80px_rgba(0,0,0,0.6)]",
          className,
        )}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}
