"use client";

import { useCallback, useEffect, useState } from "react";

/** Whole seconds left until a deadline, ticking once a second. `start(n)` (re)arms it. */
export function useCountdown(initialSeconds = 0) {
  const [endsAt, setEndsAt] = useState<number | null>(() =>
    initialSeconds > 0 ? Date.now() + initialSeconds * 1000 : null,
  );
  const [remaining, setRemaining] = useState(Math.max(0, initialSeconds));

  useEffect(() => {
    if (endsAt === null) return;
    const id = setInterval(() => {
      const left = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));
      setRemaining(left);
      if (left === 0) setEndsAt(null);
    }, 1000);
    return () => clearInterval(id);
  }, [endsAt]);

  const start = useCallback((seconds: number) => {
    setEndsAt(seconds > 0 ? Date.now() + seconds * 1000 : null);
    setRemaining(Math.max(0, seconds));
  }, []);

  return { remaining, start };
}
