import type { InputHTMLAttributes, ReactNode } from "react";

const inputClassName =
  "box-border w-full min-w-0 max-w-full rounded-control border border-border bg-surface px-3 py-2.5 text-[0.9375rem] text-ink placeholder-ink-muted/70 transition-colors focus:border-teal focus:ring-2 focus:ring-teal/20";

type TextFieldProps = {
  id: string;
  label: string;
  error?: string;
  hint?: ReactNode;
  labelClassName?: string;
  hideLabel?: boolean;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "className"> & {
  className?: string;
};

export function TextField({
  id,
  label,
  error,
  hint,
  labelClassName,
  hideLabel = false,
  className = "",
  ...inputProps
}: TextFieldProps) {
  const describedBy = [error ? `${id}-error` : null, hint ? `${id}-hint` : null]
    .filter(Boolean)
    .join(" ") || undefined;

  return (
    <div className="min-w-0">
      <label
        htmlFor={id}
        className={
          hideLabel
            ? "sr-only"
            : labelClassName ?? "mb-1.5 block text-[0.8125rem] font-semibold text-ink"
        }
      >
        {label}
      </label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={`${inputClassName} ${error ? "border-coral focus:border-coral focus:ring-coral/20" : ""} ${className}`}
        {...inputProps}
      />
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-ink-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-[0.8125rem] font-medium text-coral" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export const textFieldInputClassName = inputClassName;
