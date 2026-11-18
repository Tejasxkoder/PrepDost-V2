"use client";

import { useSyncExternalStore } from "react";
import { safeStorage } from "./storage";

/**
 * Accent presets. The colours themselves live in globals.css (`:root[data-accent="…"]`);
 * emerald is the default, so it needs no rule. `from`/`to` only drive the gradient swatches.
 */
export const ACCENTS = [
  { value: "emerald", label: "Emerald", from: "#4ade80", to: "#2f9a5c" },
  { value: "violet", label: "Violet", from: "#a78bfa", to: "#7c5ce0" },
  { value: "sky", label: "Sky", from: "#38bdf8", to: "#2496c8" },
  { value: "amber", label: "Amber", from: "#fbbf24", to: "#c9940f" },
  { value: "rose", label: "Rose", from: "#fb7185", to: "#d14a63" },
] as const;

export type Accent = (typeof ACCENTS)[number]["value"];

export const DEFAULT_ACCENT: Accent = "emerald";
/** Same key the inline boot script in app/layout.tsx reads, so the accent is applied before paint. */
export const ACCENT_STORAGE_KEY = "prepdost-accent";
const CHANGE_EVENT = "prepdost:accent";

export function isAccent(value: unknown): value is Accent {
  return ACCENTS.some((accent) => accent.value === value);
}

export function readAccent(): Accent {
  const stored = safeStorage.get(ACCENT_STORAGE_KEY);
  return isAccent(stored) ? stored : DEFAULT_ACCENT;
}

export function setAccent(accent: Accent): void {
  document.documentElement.dataset.accent = accent;
  safeStorage.set(ACCENT_STORAGE_KEY, accent);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange); // another tab changed it
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

/** Current accent; re-renders when it changes here or in another tab. */
export function useAccent(): Accent {
  return useSyncExternalStore(subscribe, readAccent, () => DEFAULT_ACCENT);
}
