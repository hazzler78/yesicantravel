export type LiteApiPaymentPublicKey = "sandbox" | "live";

/**
 * Stripe/LiteAPI Payment SDK publicKey must match the prebook secretKey environment.
 * Prebook `sandbox` flag is authoritative; never default to sandbox when config says live.
 */
export function resolveLiteApiPaymentPublicKey(opts: {
  prebookSandbox?: boolean;
  configPaymentEnv?: LiteApiPaymentPublicKey;
}): LiteApiPaymentPublicKey {
  if (typeof opts.prebookSandbox === "boolean") {
    return opts.prebookSandbox ? "sandbox" : "live";
  }
  return opts.configPaymentEnv ?? "live";
}
