import type { ReactNode } from "react";
import { CheckCircle2 } from "lucide-react";

type BookingSuccessProps = {
  bookingId?: string;
  hotelConfirmationCode?: string;
  email?: string;
  children?: ReactNode;
  actions?: ReactNode;
};

/**
 * One success screen for both the inline checkout confirmation and the
 * /confirmation page, which previously drifted apart.
 */
export function BookingSuccess({
  bookingId,
  hotelConfirmationCode,
  email,
  children,
  actions,
}: BookingSuccessProps) {
  return (
    <div className="rounded-card border border-border bg-surface p-6 shadow-card sm:p-8">
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-positive-soft text-positive">
        <CheckCircle2 className="h-6 w-6" aria-hidden />
      </span>
      <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight text-ink">
        Your stay is booked
      </h1>
      <p className="mt-2 text-[0.9375rem] text-ink-muted">
        {email ? (
          <>
            We&apos;ve sent the details to <span className="font-medium text-ink">{email}</span>.
            Your reservation is confirmed directly with the property.
          </>
        ) : (
          <>Your reservation is confirmed directly with the property.</>
        )}
      </p>

      <dl className="mt-5 grid gap-3 border-t border-border pt-5 sm:grid-cols-2">
        {bookingId && (
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-muted">
              Booking reference
            </dt>
            <dd className="tnum mt-1 text-[0.9375rem] font-semibold text-ink">{bookingId}</dd>
          </div>
        )}
        {hotelConfirmationCode && (
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-muted">
              Hotel confirmation
            </dt>
            <dd className="tnum mt-1 text-[0.9375rem] font-semibold text-ink">
              {hotelConfirmationCode}
            </dd>
          </div>
        )}
      </dl>

      {children}

      {actions && <div className="mt-6 flex flex-col gap-2 sm:flex-row">{actions}</div>}
    </div>
  );
}
