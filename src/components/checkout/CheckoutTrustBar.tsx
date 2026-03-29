export function CheckoutTrustBar() {
  return (
    <div className="mb-6 space-y-4 rounded-xl border border-[var(--ocean-teal)]/25 bg-white p-4 shadow-sm">
      <p className="text-center text-sm font-semibold leading-snug text-[var(--navy)] sm:text-base">
        Secure payments · Free cancellation up to 48 hours · Safer Stays guarantee
      </p>
      <div
        className="flex flex-wrap items-center justify-center gap-4 border-t border-[var(--navy)]/10 pt-4"
        aria-label="Accepted payment methods and security"
      >
        <span className="inline-flex h-8 items-center rounded bg-[#1a1f71] px-2.5 text-xs font-bold italic tracking-tight text-white">
          VISA
        </span>
        <span className="inline-flex h-8 items-center rounded bg-[#eb001b] px-2 text-[10px] font-bold leading-none text-white sm:text-xs">
          <span className="block pr-0.5">Mastercard</span>
        </span>
        <span className="inline-flex h-8 items-center gap-1.5 rounded border border-[var(--navy)]/15 bg-[var(--sand)] px-2.5 text-xs font-semibold text-[var(--navy)]">
          <svg className="h-4 w-4 text-[var(--ocean-teal)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          SSL secure
        </span>
      </div>
    </div>
  );
}
