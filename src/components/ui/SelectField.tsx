import type { ReactNode, SelectHTMLAttributes } from "react";

const selectClassName =
  "box-border w-full min-w-0 max-w-full rounded-lg border border-[var(--navy)]/20 bg-white px-3 py-3 text-base text-[var(--navy)] focus:border-[var(--ocean-teal)] focus:ring-2 focus:ring-[var(--ocean-teal)]/30 sm:px-4 sm:py-3.5";

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
    <div className="min-w-0 overflow-hidden">
      <label
        htmlFor={id}
        className="mb-1.5 block text-sm font-medium text-[var(--navy)] sm:mb-2 sm:text-base"
      >
        {label}
      </label>
      <select
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={`${selectClassName} ${error ? "border-red-500 focus:border-red-500 focus:ring-red-500/30" : ""} ${className}`}
        {...selectProps}
      >
        {children}
      </select>
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-[var(--navy-light)]">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-sm font-medium text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
