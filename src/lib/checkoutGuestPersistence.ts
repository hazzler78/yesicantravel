/** Guest checkout payload persisted across payment redirect (3DS / in-app browsers). */

export type CheckoutGuestPayload = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

export type CheckoutStayContext = {
  offerId?: string;
  hotelId?: string;
  checkin?: string;
  checkout?: string;
  occupancyQuery?: string;
  clientReference?: string;
};

export type StoredCheckoutGuest = CheckoutGuestPayload & {
  stayContext?: CheckoutStayContext;
  savedAt: number;
};

const LOCAL_PREFIX = "liteapi_checkout_guest_";
const SESSION_KEY = "liteapi_checkout_guest";
const CLIENT_REF_KEY = "liteapi_checkout_client_ref";
const PAYMENT_REDIRECT_FLAG = "liteapi_checkout_payment_redirect";
const PAYMENT_SUBMITTED_KEY = "liteapi_checkout_payment_submitted";
const DEFAULT_TTL_MS = 48 * 60 * 60 * 1000;

export function guestStorageKey(prebookId: string): string {
  return `${LOCAL_PREFIX}${prebookId}`;
}

export function checkoutGuestTtlMs(): number {
  return DEFAULT_TTL_MS;
}

export function isGuestRecordFresh(savedAt: number, ttlMs = DEFAULT_TTL_MS): boolean {
  return Number.isFinite(savedAt) && Date.now() - savedAt < ttlMs;
}

export function readGuestFromLocalStorage(prebookId: string): StoredCheckoutGuest | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(guestStorageKey(prebookId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredCheckoutGuest;
    if (!parsed?.savedAt || !isGuestRecordFresh(parsed.savedAt)) {
      localStorage.removeItem(guestStorageKey(prebookId));
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function writeGuestToLocalStorage(prebookId: string, guest: CheckoutGuestPayload, stayContext?: CheckoutStayContext): void {
  if (typeof window === "undefined") return;
  try {
    const record: StoredCheckoutGuest = {
      ...guest,
      stayContext,
      savedAt: Date.now(),
    };
    localStorage.setItem(guestStorageKey(prebookId), JSON.stringify(record));
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(guest));
    if (stayContext?.clientReference) {
      sessionStorage.setItem(CLIENT_REF_KEY, stayContext.clientReference);
    }
  } catch {
    // quota / private mode — sessionStorage may still work
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(guest));
    } catch {
      /* ignore */
    }
  }
}

export function readGuestFromSessionStorage(): CheckoutGuestPayload | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CheckoutGuestPayload;
  } catch {
    return null;
  }
}

export function readClientReferenceFromSession(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(CLIENT_REF_KEY);
  } catch {
    return null;
  }
}

export function resolveCheckoutGuest(prebookId: string): {
  guest: CheckoutGuestPayload;
  clientReference?: string;
  source: "localStorage" | "sessionStorage";
} | null {
  const fromLocal = readGuestFromLocalStorage(prebookId);
  if (fromLocal) {
    return {
      guest: {
        firstName: fromLocal.firstName,
        lastName: fromLocal.lastName,
        email: fromLocal.email,
        phone: fromLocal.phone,
      },
      clientReference: fromLocal.stayContext?.clientReference,
      source: "localStorage",
    };
  }
  const fromSession = readGuestFromSessionStorage();
  if (fromSession) {
    return {
      guest: fromSession,
      clientReference: readClientReferenceFromSession() ?? undefined,
      source: "sessionStorage",
    };
  }
  return null;
}

export function clearCheckoutGuestStorage(prebookId: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(guestStorageKey(prebookId));
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(CLIENT_REF_KEY);
    sessionStorage.removeItem(PAYMENT_REDIRECT_FLAG);
    sessionStorage.removeItem(`${PAYMENT_SUBMITTED_KEY}_${prebookId}`);
  } catch {
    /* ignore */
  }
}

export function markPaymentRedirectPending(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(PAYMENT_REDIRECT_FLAG, "1");
  } catch {
    /* ignore */
  }
}

export function isPaymentRedirectPending(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(PAYMENT_REDIRECT_FLAG) === "1";
  } catch {
    return false;
  }
}

export function clearPaymentRedirectPending(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(PAYMENT_REDIRECT_FLAG);
  } catch {
    /* ignore */
  }
}

export function markPaymentSubmittedForPrebook(prebookId: string): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(`${PAYMENT_SUBMITTED_KEY}_${prebookId}`, "1");
  } catch {
    /* ignore */
  }
}

export function wasPaymentSubmittedForPrebook(prebookId: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(`${PAYMENT_SUBMITTED_KEY}_${prebookId}`) === "1";
  } catch {
    return false;
  }
}
