import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type CheckoutEventKind =
  | "prebook_failed"
  | "book_failed"
  | "payment_return_failed"
  | "payment_return_orphan"
  | "payment_return_guest_missing"
  | "prebook_ok"
  | "book_ok";

export type CheckoutEventInput = {
  kind: CheckoutEventKind;
  prebookId?: string;
  transactionId?: string;
  offerId?: string;
  hotelId?: string;
  errorCode?: number;
  errorMessage?: string;
  metadata?: Record<string, unknown>;
};

function sanitizeMetadata(meta?: Record<string, unknown>): Record<string, unknown> | undefined {
  if (!meta) return undefined;
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(meta)) {
    if (/card|cvv|pan|secret/i.test(key)) continue;
    out[key] = value;
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

/** Best-effort server-side checkout funnel logging (no card data, minimal PII). */
export async function recordCheckoutEvent(input: CheckoutEventInput): Promise<void> {
  if (!process.env.DATABASE_URL) return;
  try {
    await prisma.checkoutEvent.create({
      data: {
        kind: input.kind,
        prebookId: input.prebookId ?? null,
        transactionId: input.transactionId ?? null,
        offerId: input.offerId ?? null,
        hotelId: input.hotelId ?? null,
        errorCode: input.errorCode ?? null,
        errorMessage: input.errorMessage?.slice(0, 500) ?? null,
        metadata: (sanitizeMetadata(input.metadata) ?? undefined) as Prisma.InputJsonValue | undefined,
      },
    });
  } catch (e) {
    if (typeof console !== "undefined" && console.error) {
      console.error("[checkoutTelemetry]", (e as Error).message);
    }
  }
}

const GUEST_SESSION_TTL_HOURS = 48;

export type CheckoutGuestSessionInput = {
  prebookId: string;
  holder: { firstName: string; lastName: string; email: string; phone: string };
  clientReference?: string;
  stayContext?: Record<string, unknown>;
};

export async function upsertCheckoutGuestSession(input: CheckoutGuestSessionInput): Promise<void> {
  if (!process.env.DATABASE_URL) return;
  const expiresAt = new Date(Date.now() + GUEST_SESSION_TTL_HOURS * 60 * 60 * 1000);
  try {
    await prisma.checkoutGuestSession.upsert({
      where: { prebookId: input.prebookId },
      create: {
        prebookId: input.prebookId,
        holder: input.holder,
        clientReference: input.clientReference ?? null,
        stayContext: (input.stayContext ?? undefined) as Prisma.InputJsonValue | undefined,
        expiresAt,
      },
      update: {
        holder: input.holder,
        clientReference: input.clientReference ?? null,
        stayContext: (input.stayContext ?? undefined) as Prisma.InputJsonValue | undefined,
        expiresAt,
      },
    });
  } catch (e) {
    if (typeof console !== "undefined" && console.error) {
      console.error("[checkoutGuestSession]", (e as Error).message);
    }
  }
}

export async function getCheckoutGuestSession(prebookId: string) {
  if (!process.env.DATABASE_URL) return null;
  try {
    const row = await prisma.checkoutGuestSession.findUnique({ where: { prebookId } });
    if (!row || row.expiresAt < new Date()) {
      if (row) {
        await prisma.checkoutGuestSession.delete({ where: { prebookId } }).catch(() => {});
      }
      return null;
    }
    return row;
  } catch {
    return null;
  }
}

export async function deleteCheckoutGuestSession(prebookId: string): Promise<void> {
  if (!process.env.DATABASE_URL) return;
  try {
    await prisma.checkoutGuestSession.delete({ where: { prebookId } });
  } catch {
    /* ignore */
  }
}
