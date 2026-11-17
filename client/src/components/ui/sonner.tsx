"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

export function Toaster(props: ToasterProps) {
  const { resolvedTheme } = useTheme();
  return (
    <Sonner
      theme={(resolvedTheme as ToasterProps["theme"]) ?? "dark"}
      position="bottom-right"
      toastOptions={{
        style: {
          background: "var(--bg-1)",
          border: "1px solid var(--border)",
          color: "var(--text-0)",
          borderRadius: "14px",
        },
      }}
      {...props}
    />
  );
}
