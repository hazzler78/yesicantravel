import type { ReactNode, SelectHTMLAttributes } from "react";

const selectClassName =
  "box-border w-full min-w-0 max-w-full appearance-none rounded-control border border-border bg-surface px-3 py-2.5 text-[0.9375rem] text-ink transition-colors focus:border-teal focus:ring-2 focus:ring-teal/20";

type SelectFieldProps = {
  id: string;
  label: string;
  error?: string;
  hint?: ReactNode;
  children: ReactNode;
} & Omit<SelectHTMLAttributes<HTMLSelectElement>, "id" | "className"> & {
  className?: string;
};

export function SelectField({
  id,
  label,
  error,
  hint,
  children,
  className = "",
  ...selectProps
}: SelectFieldProps) {
  const describedBy = [error ? `${id}-error` : null, hint ? `${id}-hint` : null]
    .filter(Boolean)
    .join(" ") || undefined;

  return (
    <div className="min-w-0">
      <label htmlFor={id} className="mb-1.5 block text-[0.8125rem] font-semibold text-ink">
        {label}
      </label>
      <select
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={`${selectClassName} ${error ? "border-coral focus:border-coral focus:ring-coral/20" : ""} ${className}`}
        {...selectProps}
      >
        {children}
      </select>
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

export const selectFieldClassName = selectClassName;
