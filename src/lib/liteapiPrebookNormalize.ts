/** Normalize LiteAPI prebook JSON shape for the checkout client (no secrets in logs). */

export type NormalizedPrebookData = {
  prebookId: string;
  transactionId?: string;
  secretKey?: string;
  sandbox?: boolean;
};

export function normalizePrebookResponse(
  raw: unknown
): { data: NormalizedPrebookData } & { sandbox?: boolean } {
  const root = (raw ?? {}) as Record<string, unknown>;
  const inner = (root.data ?? root) as Record<string, unknown>;
  const sandbox =
    typeof inner.sandbox === "boolean"
      ? inner.sandbox
      : typeof root.sandbox === "boolean"
        ? root.sandbox
        : undefined;
  const prebookId = typeof inner.prebookId === "string" ? inner.prebookId : "";
  const transactionId =
    typeof inner.transactionId === "string" ? inner.transactionId : undefined;
  const secretKey = typeof inner.secretKey === "string" ? inner.secretKey : undefined;
  return {
    data: { prebookId, transactionId, secretKey, sandbox },
    ...(sandbox !== undefined ? { sandbox } : {}),
  };
}

export function prebookPaymentFieldsMissing(
  data: NormalizedPrebookData,
  usePaymentSdk: boolean
): string | null {
  if (!data.prebookId) return "prebook_missing_id";
  if (!usePaymentSdk) return null;
  if (!data.transactionId?.trim()) return "prebook_missing_transaction_id";
  if (!data.secretKey?.trim()) return "prebook_missing_secret_key";
  return null;
}
