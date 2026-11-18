import type { ReactNode } from "react";

interface FieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  /** Right-aligned element on the label row (e.g. "Forgot password?"). */
  aside?: ReactNode;
  children: ReactNode;
}

export function Field({ label, htmlFor, error, aside, children }: FieldProps) {
  return (
    <div className="mb-3">
      <div className="mb-1.5 flex items-center justify-between">
        <label htmlFor={htmlFor} className="text-[11.5px] text-fg-muted">
          {label}
        </label>
        {aside}
      </div>
      {children}
      {error ? (
        <p role="alert" className="mt-1 text-[11.5px] text-rose">
          {error}
        </p>
      ) : null}
    </div>
  );
}
