/**
 * Stripe (via LiteAPI Payment SDK) appends redirect_status on return from 3DS / redirect flows.
 * @see https://docs.liteapi.travel/docs/direct-stripe-integration-stripe-elements
 */

export type PaymentRedirectStatus = "succeeded" | "failed" | "processing" | "unknown" | "absent";

export function parsePaymentRedirectStatus(
  redirectStatus: string | null | undefined
): PaymentRedirectStatus {
  if (!redirectStatus || !redirectStatus.trim()) return "absent";
  const normalized = redirectStatus.trim().toLowerCase();
  if (normalized === "succeeded") return "succeeded";
  if (normalized === "failed") return "failed";
  if (normalized === "processing") return "processing";
  return "unknown";
}

export function paymentRedirectIndicatesSuccess(status: PaymentRedirectStatus): boolean {
  return status === "succeeded";
}

export function paymentRedirectIndicatesFailure(status: PaymentRedirectStatus): boolean {
  return status === "failed";
}

export function shouldAttemptBookingAfterPaymentReturn(
  transactionId: string | null | undefined,
  redirectStatus: PaymentRedirectStatus
): { attempt: boolean; reason?: string } {
  if (!transactionId?.trim()) {
    return { attempt: false, reason: "missing_transaction_id" };
  }
  if (redirectStatus === "failed") {
    return { attempt: false, reason: "redirect_status_failed" };
  }
  if (redirectStatus === "processing") {
    return { attempt: false, reason: "redirect_status_processing" };
  }
  if (redirectStatus === "unknown") {
    return { attempt: false, reason: "redirect_status_unknown" };
  }
  // succeeded, or absent (older SDK returns without Stripe query params)
  return { attempt: true };
}

export function paymentFailureUserMessage(status: PaymentRedirectStatus): string {
  if (status === "failed") {
    return "Your card payment did not go through. You were not charged — please try again or use a different card.";
  }
  if (status === "processing") {
    return "Your bank is still processing the payment. Wait a moment, then refresh this page. If it stays stuck, contact support with your prebook reference.";
  }
  if (status === "unknown") {
    return "We could not confirm whether your payment went through. Please try again or contact support with your prebook reference.";
  }
  return "Your card payment did not go through. You were not charged — please try again.";
}

export function guestMissingAfterPaymentMessage(prebookId: string): string {
  return `Your payment may have gone through, but we could not retrieve your guest details to finish the booking. Please contact support with reference: ${prebookId}`;
}
